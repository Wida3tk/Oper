import { authorize, can, ensureFinanceClassificationSchema, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";
const num=(value:unknown)=>Number(value||0);

export async function GET(req:Request){
  const auth=await authorize(req,["sales","finance","academy","viewer"]);if(!auth.ok)return auth.response;
  const db=operationalDb();await ensureFinanceClassificationSchema(db);
  const requested=new URL(req.url).searchParams.get("month")||new Date().toISOString().slice(0,7);
  const month=/^\d{4}-\d{2}$/.test(requested)?requested:new Date().toISOString().slice(0,7);
  const today=new Date().toISOString().slice(0,10),canSeeFinance=auth.roles.includes("admin")||auth.roles.includes("finance")||can(auth,"finance.view"),isAdmin=auth.roles.includes("admin");
  const taskScope=isAdmin?"":"AND assignee_email=?";
  const taskQuery=db.prepare(`SELECT id,title,department,priority,due_at FROM workflow_tasks WHERE status!='مكتملة' ${taskScope} ORDER BY CASE priority WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,due_at LIMIT 6`);
  const [account,tasks,customers,enrollments,reservations,journey,activity]=await Promise.all([
    db.prepare("SELECT display_name FROM staff_accounts WHERE email=?").bind(auth.email).first<{display_name:string}>(),
    (isAdmin?taskQuery:taskQuery.bind(auth.email)).all(),
    db.prepare("SELECT COUNT(*) count FROM customers WHERE substr(created_at,1,10)=? AND deleted_at IS NULL").bind(today).first(),
    db.prepare("SELECT COUNT(*) count FROM enrollments WHERE status!='مكتمل'").first(),
    db.prepare("SELECT COUNT(*) count FROM seat_reservations WHERE status NOT IN ('تم التحويل','تم النقل')").first(),
    db.prepare("SELECT status,COUNT(*) count FROM enrollments GROUP BY status ORDER BY MIN(created_at)").all(),
    db.prepare("SELECT a.id,a.action,a.entity_type,a.entity_id,a.actor_email,a.created_at,s.display_name actor_name FROM audit_log a LEFT JOIN staff_accounts s ON s.email=a.actor_email ORDER BY a.created_at DESC LIMIT 10").all(),
  ]);
  let finance=null;
  if(canSeeFinance){
    const [contracts,contractPayments,flows,target,review]=await Promise.all([
      db.prepare("SELECT COUNT(*) orders,COALESCE(SUM(total),0) value FROM orders WHERE substr(created_at,1,7)=?").bind(month).first(),
      db.prepare(`SELECT COALESCE(SUM(p.amount),0) paid
        FROM payments p JOIN orders o ON o.id=p.order_id
        WHERE substr(o.created_at,1,7)=? AND p.classification_status='confirmed'`).bind(month).first(),
      db.prepare(`SELECT substr(COALESCE(paid_at,created_at),1,10) day,
        COALESCE(SUM(CASE WHEN flow_type='sale' THEN amount ELSE 0 END),0) sales,
        COALESCE(SUM(CASE WHEN flow_type='collection' THEN amount ELSE 0 END),0) collections
        FROM payments WHERE classification_status='confirmed' AND flow_type IN ('sale','collection') AND substr(COALESCE(paid_at,created_at),1,7)=?
        GROUP BY day ORDER BY day`).bind(month).all(),
      db.prepare("SELECT target_amount FROM monthly_sales_targets WHERE month_key=?").bind(month).first(),
      db.prepare("SELECT COUNT(*) count FROM orders WHERE finance_review_status='pending'").first(),
    ]);
    const daily=flows.results.map(row=>({day:String(row.day),sales:num(row.sales),collections:num(row.collections)}));
    const sales=daily.reduce((sum,row)=>sum+row.sales,0),collections=daily.reduce((sum,row)=>sum+row.collections,0),contractValue=num((contracts as Record<string,unknown>)?.value);
    finance={month,orders:num((contracts as Record<string,unknown>)?.orders),contractValue,sales,collections,cash:sales+collections,remaining:Math.max(contractValue-num((contractPayments as Record<string,unknown>)?.paid),0),target:num((target as Record<string,unknown>)?.target_amount),reviewCount:num((review as Record<string,unknown>)?.count),daily};
  }
  return Response.json({
    user:{email:auth.email,name:account?.display_name||auth.email.split("@")[0],roles:auth.roles},
    canSeeFinance,canEditFinanceTarget:can(auth,"finance.total.edit"),
    operations:{tasks:tasks.results.length,customersToday:num((customers as Record<string,unknown>)?.count),activeEnrollments:num((enrollments as Record<string,unknown>)?.count),activeReservations:num((reservations as Record<string,unknown>)?.count)},
    tasks:tasks.results,journey:journey.results,activity:activity.results,finance,generatedAt:new Date().toISOString()
  });
}

export async function PATCH(req:Request){
  const auth=await authorize(req,["finance"]);if(!auth.ok)return auth.response;
  if(!can(auth,"finance.total.edit"))return Response.json({error:"ليس لديك صلاحية تعديل هدف المبيعات"},{status:403});
  const body=await req.json() as Record<string,unknown>,month=String(body.month||""),target=Number(body.target||0);
  if(!/^\d{4}-\d{2}$/.test(month)||!Number.isFinite(target)||target<0)return Response.json({error:"الشهر والهدف مطلوبان"},{status:400});
  const db=operationalDb();await ensureFinanceClassificationSchema(db);const now=new Date().toISOString();
  await db.prepare("INSERT INTO monthly_sales_targets(month_key,target_amount,updated_by_email,updated_at) VALUES(?,?,?,?) ON CONFLICT(month_key) DO UPDATE SET target_amount=excluded.target_amount,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(month,target,auth.email,now).run();
  return Response.json({ok:true,month,target});
}
