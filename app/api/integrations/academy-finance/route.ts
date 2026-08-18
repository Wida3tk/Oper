import { env } from "cloudflare:workers";
import { authorizeIntegrationRequest, ensureFinanceClassificationSchema, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

const cents=(value:unknown)=>Math.round(Number(value||0)*100);
const money=(value:number)=>value/100;

async function ensureWithdrawalSchema(db:ReturnType<typeof operationalDb>){
  await db.prepare("CREATE TABLE IF NOT EXISTS withdrawals(id TEXT PRIMARY KEY,order_id TEXT NOT NULL UNIQUE,reason TEXT NOT NULL,withdrawn_at TEXT NOT NULL,gross_paid REAL NOT NULL,non_refundable_amount REAL NOT NULL DEFAULT 0,refund_amount REAL NOT NULL DEFAULT 0,refund_source TEXT NOT NULL,refund_method TEXT NOT NULL,reference TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'مكتمل',created_by_email TEXT NOT NULL,created_at TEXT NOT NULL)").run();
}
async function ensureOrderPaymentReferenceSchema(db:ReturnType<typeof operationalDb>){
  await db.prepare("CREATE TABLE IF NOT EXISTS order_payment_references(order_id TEXT PRIMARY KEY,reference TEXT NOT NULL,updated_by_email TEXT NOT NULL,updated_at TEXT NOT NULL)").run();
}

function paymentBehavior(installments:Record<string,unknown>[],today:string){
  const paid=installments.filter(x=>x.status==="مدفوع");
  const overdue=installments.filter(x=>x.status!=="مدفوع"&&String(x.due_date)<today);
  const summary=`${paid.length} قسط مسدد · ${overdue.length} متأخر · ${installments.reduce((sum,x)=>sum+Number(x.reminder_count||0),0)} تذكير مسجل`;
  if(!installments.length) return { label:"جديد", tone:"neutral", summary };
  const behaviorOf=(x:Record<string,unknown>)=>{
    const reminders=Number(x.reminder_count||0);
    if(String(x.status)==="تطبيق السياسة") return "تطبيق السياسة";
    if(reminders>=4) return "تذكير نهائي";
    if(reminders===3) return "تذكير ثالث";
    if(reminders===2) return "تذكير ثان";
    if(reminders===1) return "تذكير أول";
    if(String(x.status)==="موافقة تمديد") return "موافقة تمديد";
    if(String(x.status)==="متأخر" || (String(x.due_date)<today && String(x.status)!=="مدفوع")) return "متأخر";
    return "ملتزم";
  };
  const counts=new Map<string,number>();
  for(const installment of installments){
    const label=behaviorOf(installment);
    counts.set(label,(counts.get(label)||0)+1);
  }
  const priority=["تطبيق السياسة","تذكير نهائي","تذكير ثالث","تذكير ثان","تذكير أول","متأخر","موافقة تمديد","ملتزم"];
  const label=[...counts].sort((a,b)=>b[1]-a[1]||priority.indexOf(a[0])-priority.indexOf(b[0]))[0]?.[0]||"ملتزم";
  const tone=label==="ملتزم"?"green":label==="تطبيق السياسة"||label==="متأخر"||label==="تذكير نهائي"?"red":label==="تذكير ثالث"||label==="تذكير ثان"?"purple":"amber";
  return { label, tone, summary };
}

export async function GET(req:Request){
  const integration=await authorizeIntegrationRequest(req, env.SULUKERA_ACADEMY_INTEGRATION_TOKEN);
  if(!integration.ok) return integration.response;

  const url=new URL(req.url);
  const customerId=(url.searchParams.get("customerId")||"").trim();
  const orderId=(url.searchParams.get("orderId")||"").trim();
  if(!customerId && !orderId) return Response.json({ error:"customerId أو orderId مطلوب" },{ status:400 });

  const db=operationalDb();
  await ensureFinanceClassificationSchema(db);
  await ensureWithdrawalSchema(db);
  await ensureOrderPaymentReferenceSchema(db);

  const order=await db.prepare(`
    SELECT o.id order_id,o.order_number,o.customer_id,o.program,o.track,o.payment_plan,o.total,o.paid,o.status order_status,o.finance_review_status,o.cohort_label,o.scheduled_start_date,
           c.name customer_name,c.phone,c.email
    FROM orders o
    JOIN customers c ON c.id=o.customer_id
    WHERE c.deleted_at IS NULL
      AND (?='' OR o.id=?)
      AND (?='' OR o.customer_id=?)
    ORDER BY o.created_at DESC
    LIMIT 1
  `).bind(orderId,orderId,customerId,customerId).first<Record<string,unknown>>();
  if(!order) return Response.json({ error:"لم يتم العثور على سجل مالي مطابق" },{ status:404 });

  const [installmentsResult,paymentsResult,referenceRow,withdrawalRow]=await Promise.all([
    db.prepare("SELECT id,sequence,amount_cents,due_date,status,paid_payment_id,paid_at,reference,reminder_count,first_reminder_at,second_reminder_at,last_reminded_by_email FROM installments WHERE order_id=? ORDER BY sequence").bind(order.order_id).all<Record<string,unknown>>(),
    db.prepare("SELECT id,amount,paid_at,status,method,reference,flow_type,classification_status,created_at FROM payments WHERE order_id=? ORDER BY COALESCE(paid_at,created_at),created_at").bind(order.order_id).all<Record<string,unknown>>(),
    db.prepare("SELECT reference FROM order_payment_references WHERE order_id=?").bind(order.order_id).first<{reference:string}>(),
    db.prepare("SELECT id,refund_amount,status,withdrawn_at FROM withdrawals WHERE order_id=?").bind(order.order_id).first<Record<string,unknown>>()
  ]);

  const totalCents=cents(order.total);
  const grossPaidCents=paymentsResult.results.reduce((sum,payment)=>sum+cents(payment.amount),0);
  const refundedCents=cents(withdrawalRow?.refund_amount);
  const paidCents=Math.max(grossPaidCents-refundedCents,0);
  const remainingCents=Math.max(totalCents-paidCents,0);
  const today=new Date().toISOString().slice(0,10);
  const installments=installmentsResult.results.map(inst=>({
    id:String(inst.id||""),
    sequence:Number(inst.sequence||0),
    label:`قسط ${Number(inst.sequence||0)}`,
    amount:money(Number(inst.amount_cents||0)),
    dueDate:String(inst.due_date||""),
    status:String(inst.status||"قادم"),
    displayStatus:String(inst.status)==="مدفوع" ? "مدفوع" : String(inst.due_date)<today ? "متأخر" : String(inst.status)==="قادم" ? "ملتزم" : String(inst.status||""),
    paidAt:inst.paid_at||null,
    reference:inst.reference||null,
    reminderCount:Number(inst.reminder_count||0)
  }));

  return Response.json({
    source:"oper",
    syncedAt:new Date().toISOString(),
    customerId:String(order.customer_id||""),
    customerName:String(order.customer_name||""),
    phone:String(order.phone||""),
    email:String(order.email||""),
    orderId:String(order.order_id||""),
    orderNumber:String(order.order_number||""),
    program:String(order.program||""),
    track:String(order.track||""),
    batch:String(order.cohort_label||""),
    scheduledStartDate:String(order.scheduled_start_date||""),
    paymentPlan:String(order.payment_plan||""),
    totalAmount:money(totalCents),
    paidAmount:money(paidCents),
    remainingAmount:money(remainingCents),
    orderStatus:String(order.order_status||""),
    financeReviewStatus:String(order.finance_review_status||""),
    paymentBehavior:paymentBehavior(installmentsResult.results,today),
    withdrawal:withdrawalRow ? {
      id:String(withdrawalRow.id||""),
      status:String(withdrawalRow.status||""),
      withdrawnAt:String(withdrawalRow.withdrawn_at||""),
      refundAmount:money(refundedCents)
    } : null,
    orderPaymentReference:referenceRow?.reference||"",
    payments:paymentsResult.results.map(payment=>({
      id:String(payment.id||""),
      amount:Number(payment.amount||0),
      paidAt:payment.paid_at||null,
      status:String(payment.status||""),
      method:String(payment.method||""),
      reference:String(payment.reference||""),
      flowType:String(payment.flow_type||""),
      classificationStatus:String(payment.classification_status||"")
    })),
    installments
  });
}
