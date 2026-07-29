import { authorize, can, ensureFinanceClassificationSchema, id, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";
const cents=(value:unknown)=>Math.round(Number(value||0)*100);
const money=(value:number)=>value/100;

export async function GET(req:Request){
 const auth=await authorize(req,["finance","viewer"]);if(!auth.ok)return auth.response;
 if(!can(auth,"finance.view"))return Response.json({error:"لا تملكين صلاحية عرض المالية"},{status:403});
 const db=operationalDb();
 await ensureFinanceClassificationSchema(db);
 const [ordersResult,paymentsResult,installmentsResult,notesResult]=await Promise.all([
  db.prepare("SELECT o.id order_id,o.order_type,o.purchase_source,o.payment_plan,o.total stored_total,o.status order_status,o.finance_review_status,c.id customer_id,c.name customer_name,c.phone,c.email,p.name program_name FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN programs p ON p.id=o.program_id ORDER BY CASE o.finance_review_status WHEN 'pending' THEN 0 ELSE 1 END,o.updated_at DESC LIMIT 200").all<Record<string,unknown>>(),
  db.prepare("SELECT pay.id,pay.order_id,pay.amount,pay.due_date,pay.paid_at,pay.status,pay.method,pay.reference,pay.proof_asset_key,pay.flow_type,pay.classification_status,pay.created_at,(SELECT pi.id FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) payment_intent_id,(SELECT pi.status FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) reconciliation_status FROM payments pay ORDER BY COALESCE(pay.paid_at,pay.created_at) DESC").all<Record<string,unknown>>(),
  db.prepare("SELECT id,order_id,sequence,amount_cents,due_date,status,paid_payment_id,paid_at,reference FROM installments ORDER BY order_id,sequence").all<Record<string,unknown>>(),
  db.prepare("SELECT order_id,note,updated_by_email,updated_at FROM finance_notes").all<Record<string,unknown>>()
 ]);
 const today=new Date().toISOString().slice(0,10);
 const orders=ordersResult.results.map(order=>{
  const orderPayments=paymentsResult.results.filter(x=>x.order_id===order.order_id);
  const paidCents=orderPayments.reduce((sum,x)=>sum+cents(x.amount),0),totalCents=cents(order.stored_total),remainingCents=Math.max(totalCents-paidCents,0);
  const orderInstallments=installmentsResult.results.filter(x=>x.order_id===order.order_id).map(x=>({...x,amount:money(Number(x.amount_cents)),display_status:x.status!=="مدفوع"&&String(x.due_date)<today?"متأخر":x.status}));
  const note=notesResult.results.find(x=>x.order_id===order.order_id);
  return {...order,total:money(totalCents),paid:money(paidCents),remaining:money(remainingCents),overpayment:money(Math.max(paidCents-totalCents,0)),payments:orderPayments,installments:orderInstallments,finance_note:note?.note||""};
 });
 const totalCents=orders.reduce((s,o)=>s+cents(o.total),0),paidCents=orders.reduce((s,o)=>s+cents(o.paid),0),remainingCents=orders.reduce((s,o)=>s+cents(o.remaining),0);
 return Response.json({orders,summary:{total:money(totalCents),paid:money(paidCents),remaining:money(remainingCents),overdue:orders.reduce((s,o)=>s+o.installments.filter(x=>x.display_status==="متأخر").length,0)}});
}

function dueDate(start:string,offset:number){
 const [year,month,day]=start.split("-").map(Number),targetMonth=month-1+offset,targetYear=year+Math.floor(targetMonth/12),normalizedMonth=((targetMonth%12)+12)%12,lastDay=new Date(Date.UTC(targetYear,normalizedMonth+1,0)).getUTCDate();
 return `${targetYear}-${String(normalizedMonth+1).padStart(2,"0")}-${String(Math.min(day,lastDay)).padStart(2,"0")}`;
}

export async function POST(req:Request){
 const auth=await authorize(req,["finance"]);if(!auth.ok)return auth.response;
 const body=await req.json() as Record<string,unknown>,action=String(body.action||""),orderId=String(body.orderId||"");
 if(!orderId)return Response.json({error:"رقم الطلب مطلوب"},{status:400});
 const db=operationalDb(),now=new Date().toISOString(),order=await db.prepare("SELECT id,total FROM orders WHERE id=?").bind(orderId).first<{id:string,total:number}>();
 if(!order)return Response.json({error:"الطلب غير موجود"},{status:404});
 const paidRow=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=?").bind(orderId).first<{paid:number}>(),paidCents=cents(paidRow?.paid);
 if(action==="review_legacy_installments"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية مراجعة الأقساط"},{status:403});
  const review=await db.prepare("SELECT finance_review_status FROM orders WHERE id=?").bind(orderId).first<{finance_review_status:string}>();
  if(review?.finance_review_status!=="pending")return Response.json({error:"الطلب لا ينتظر مراجعة المالية"},{status:409});
  const first=await db.prepare("SELECT id FROM payments WHERE order_id=? ORDER BY COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string}>();
  await db.batch([
   db.prepare("UPDATE payments SET flow_type=CASE WHEN id=? THEN 'sale' WHEN id IN (SELECT paid_payment_id FROM installments WHERE order_id=? AND paid_payment_id IS NOT NULL) THEN 'collection' ELSE 'collection' END,classification_status='confirmed' WHERE order_id=?").bind(first?.id||"",orderId,orderId),
   db.prepare("UPDATE orders SET finance_review_status='approved',updated_at=? WHERE id=?").bind(now,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'APPROVE_LEGACY_INSTALLMENTS','order',?,'{}',?)").bind(id("AUD"),auth.email,orderId,now)
  ]);
  return Response.json({ok:true});
 }
 if(action==="schedule"){
  if(!can(auth,"finance.total.edit")||!can(auth,"finance.installments.manage"))return Response.json({error:"لا تملكين صلاحية تعديل الإجمالي والأقساط"},{status:403});
  const totalCents=cents(body.total),count=Math.floor(Number(body.count||0)),start=String(body.start||"");
  if(totalCents<paidCents)return Response.json({error:"إجمالي العقد لا يمكن أن يكون أقل من الدفعات المسجلة"},{status:400});
  if(count<1||count>36||!/^\d{4}-\d{2}-\d{2}$/.test(start))return Response.json({error:"عدد الأقساط وتاريخ البداية مطلوبان"},{status:400});
  const remaining=totalCents-paidCents;if(remaining<1)return Response.json({error:"إجمالي العقد الحالي يساوي المبلغ المدفوع. عدّلي إجمالي العقد إلى قيمته الكاملة أولاً، ثم أنشئي جدول الأقساط"},{status:400});
  const base=Math.floor(remaining/count),extra=remaining-base*count;if(base<1)return Response.json({error:"عدد الأقساط أكبر من المبلغ المتبقي"},{status:400});
  const paidSeq=await db.prepare("SELECT COALESCE(MAX(sequence),0) seq FROM installments WHERE order_id=? AND status='مدفوع'").bind(orderId).first<{seq:number}>();
  const statements=[db.prepare("UPDATE orders SET total=?,paid=?,payment_plan='أقساط',status=?,updated_at=? WHERE id=?").bind(money(totalCents),money(paidCents),remaining===0?"مدفوع":"مدفوع جزئياً",now,orderId),db.prepare("DELETE FROM installments WHERE order_id=? AND status!='مدفوع'").bind(orderId)];
  for(let i=0;i<count;i++)statements.push(db.prepare("INSERT INTO installments(id,order_id,sequence,amount_cents,due_date,status,created_at,updated_at) VALUES(?,?,?,?,?,'قادم',?,?)").bind(id("INS"),orderId,Number(paidSeq?.seq||0)+i+1,base+(i===count-1?extra:0),dueDate(start,i),now,now));
  await db.batch(statements);return Response.json({ok:true});
 }
 if(action==="pay_installment"){
  if(!can(auth,"finance.payments.record"))return Response.json({error:"لا تملكين صلاحية تسجيل الدفعات والمراجع"},{status:403});
  const installmentId=String(body.installmentId||""),method=String(body.method||"").trim(),reference=String(body.reference||"").trim();
  const installment=await db.prepare("SELECT id,amount_cents,status FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string,amount_cents:number,status:string}>();
  if(!installment||installment.status==="مدفوع")return Response.json({error:"القسط غير متاح للسداد"},{status:409});
  if(!method||!reference)return Response.json({error:"وسيلة الدفع والرقم المرجعي مطلوبان"},{status:400});
  const totalCents=cents(order.total);if(paidCents+installment.amount_cents>totalCents)return Response.json({error:"هذه الدفعة تتجاوز المتبقي على العميل"},{status:400});
  const paymentId=id("PAY"),newPaid=paidCents+installment.amount_cents;
  await db.batch([db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,flow_type,classification_status,created_at) VALUES(?,?,?,?,?,?,?,'collection','confirmed',?)").bind(paymentId,orderId,money(installment.amount_cents),now,"مسجلة",method,reference,now),db.prepare("UPDATE installments SET status='مدفوع',paid_payment_id=?,paid_at=?,reference=?,updated_at=? WHERE id=?").bind(paymentId,now,reference,now,installmentId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(newPaid),newPaid===totalCents?"مدفوع":"مدفوع جزئياً",now,orderId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'PAY_INSTALLMENT','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,paymentId,amount:money(installment.amount_cents),reference}),now)]);
  return Response.json({ok:true});
 }
 if(action==="installment_status"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"لا تملكين صلاحية متابعة الأقساط"},{status:403});
  const installmentId=String(body.installmentId||""),status=String(body.status||"");
  if(!["قادم","تذكير أول","تذكير ثانٍ","تذكير ثالث","متأخر","إنذار","تطبيق السياسة"].includes(status))return Response.json({error:"حالة القسط غير صالحة"},{status:400});
  await db.prepare("UPDATE installments SET status=?,updated_at=? WHERE id=? AND order_id=? AND status!='مدفوع'").bind(status,now,installmentId,orderId).run();return Response.json({ok:true});
 }
 if(action==="note"){
  const note=String(body.note||"").trim();await db.prepare("INSERT INTO finance_notes(order_id,note,updated_by_email,updated_at) VALUES(?,?,?,?) ON CONFLICT(order_id) DO UPDATE SET note=excluded.note,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(orderId,note,auth.email,now).run();return Response.json({ok:true});
 }
 return Response.json({error:"الإجراء المالي غير صالح"},{status:400});
}
