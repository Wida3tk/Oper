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
  const pendingQuery=db.prepare(`SELECT COUNT(DISTINCT entity_id) count FROM workflow_tasks WHERE status!='مكتملة' ${taskScope}`);
  const [account,tasks,pendingCustomers,customers,totalCustomers,reservations,journey,activity,traineeRows]=await Promise.all([
    db.prepare("SELECT display_name FROM staff_accounts WHERE email=?").bind(auth.email).first<{display_name:string}>(),
    (isAdmin?taskQuery:taskQuery.bind(auth.email)).all(),
    (isAdmin?pendingQuery:pendingQuery.bind(auth.email)).first(),
    db.prepare("SELECT COUNT(*) count FROM customers WHERE substr(created_at,1,10)=? AND deleted_at IS NULL").bind(today).first(),
    db.prepare("SELECT COUNT(*) count FROM customers WHERE deleted_at IS NULL").first(),
    db.prepare("SELECT COUNT(*) count FROM seat_reservations WHERE status NOT IN ('تم التحويل','تم النقل')").first(),
    db.prepare("SELECT status,COUNT(*) count FROM enrollments GROUP BY status ORDER BY MIN(created_at)").all(),
    db.prepare(`SELECT a.id,a.action,a.entity_type,a.entity_id,a.actor_email,a.created_at,s.display_name actor_name,
      CASE a.entity_type
        WHEN 'customer' THEN (SELECT c.name FROM customers c WHERE c.id=a.entity_id)
        WHEN 'payment' THEN (SELECT c.name FROM payments pay JOIN orders o ON o.id=pay.order_id JOIN customers c ON c.id=o.customer_id WHERE pay.id=a.entity_id)
        WHEN 'payment_intent' THEN (SELECT c.name FROM payment_intents pi JOIN customers c ON c.id=pi.resulting_customer_id WHERE pi.id=a.entity_id)
        WHEN 'installment' THEN (SELECT c.name FROM installments ins JOIN orders o ON o.id=ins.order_id JOIN customers c ON c.id=o.customer_id WHERE ins.id=a.entity_id)
        WHEN 'order' THEN (SELECT c.name FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=a.entity_id)
        WHEN 'enrollment' THEN (SELECT c.name FROM enrollments e JOIN customers c ON c.id=e.customer_id WHERE e.id=a.entity_id)
        WHEN 'trial' THEN (SELECT c.name FROM program_trials t JOIN customers c ON c.id=t.customer_id WHERE t.id=a.entity_id)
        WHEN 'seat_reservation' THEN (SELECT c.name FROM seat_reservations r JOIN customers c ON c.id=r.customer_id WHERE r.id=a.entity_id)
        ELSE NULL
      END subject_name
      FROM audit_log a LEFT JOIN staff_accounts s ON s.email=a.actor_email ORDER BY a.created_at DESC LIMIT 10`).all(),
    db.prepare(`SELECT p.name program_name,COALESCE(NULLIF(o.track,''),'غير محدد') detail,COUNT(DISTINCT e.customer_id) count
      FROM enrollments e JOIN programs p ON p.id=e.program_id JOIN orders o ON o.id=e.order_id
      GROUP BY p.name,COALESCE(NULLIF(o.track,''),'غير محدد') ORDER BY count DESC,p.name`).all(),
  ]);
  const traineeGroups=[
    {key:"aba",label:"شهادة تحليل السلوك",match:(name:string)=>name.includes("تحليل السلوك التطبيقي")},
    {key:"obm",label:"إدارة السلوك التنظيمي",match:(name:string)=>name.includes("إدارة السلوك التنظيمي")},
    {key:"ca",label:"تقييم الكفاءة",match:(name:string)=>name.includes("تقييم الكفاءة")},
    {key:"ceu",label:"التعليم المستمر",match:(name:string)=>!name.includes("تحليل السلوك التطبيقي")&&!name.includes("إدارة السلوك التنظيمي")&&!name.includes("تقييم الكفاءة")},
  ].map(group=>{const rows=(traineeRows.results as Record<string,unknown>[]).filter(row=>group.match(String(row.program_name||"")));const details=new Map<string,number>();for(const row of rows){const program=String(row.program_name||"غير محدد"),track=String(row.detail||"غير محدد"),label=group.key==="ceu"?program:(track==="غير محدد"?program:track);details.set(label,(details.get(label)||0)+num(row.count))}return {key:group.key,label:group.label,count:rows.reduce((sum,row)=>sum+num(row.count),0),details:[...details].map(([label,count])=>({label,count})).sort((a,b)=>b.count-a.count)};});
  let finance=null;
  if(canSeeFinance){
    const [contracts,contractPayments,flows,target,review]=await Promise.all([
      db.prepare("SELECT COUNT(*) orders,COALESCE(SUM(o.total),0) value FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.deleted_at IS NULL AND substr(o.created_at,1,7)=?").bind(month).first(),
      db.prepare(`SELECT COALESCE(SUM(p.amount),0) paid
        FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
        WHERE c.deleted_at IS NULL AND substr(o.created_at,1,7)=? AND p.classification_status='confirmed'`).bind(month).first(),
      db.prepare(`SELECT substr(COALESCE(p.paid_at,p.created_at),1,10) day,
        COALESCE(SUM(CASE WHEN p.flow_type='sale' THEN p.amount ELSE 0 END),0) sales,
        COALESCE(SUM(CASE WHEN p.flow_type='collection' THEN p.amount ELSE 0 END),0) collections
        FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id
        WHERE c.deleted_at IS NULL AND p.classification_status='confirmed' AND p.flow_type IN ('sale','collection') AND substr(COALESCE(p.paid_at,p.created_at),1,7)=?
        GROUP BY day ORDER BY day`).bind(month).all(),
      db.prepare("SELECT target_amount FROM monthly_sales_targets WHERE month_key=?").bind(month).first(),
      db.prepare(`SELECT CASE
        WHEN o.order_type='إشراف' THEN 'supervision'
        WHEN o.payment_plan='أقساط' THEN 'installments'
        WHEN lower(COALESCE((SELECT pay.method FROM payments pay WHERE pay.order_id=o.id ORDER BY pay.created_at LIMIT 1),'')) LIKE '%paytabs%' THEN 'paytabs'
        WHEN COALESCE((SELECT pay.method FROM payments pay WHERE pay.order_id=o.id ORDER BY pay.created_at LIMIT 1),'') LIKE '%تحويل بنكي%' THEN 'bank'
        ELSE 'other' END kind,COUNT(*) count
        FROM orders o JOIN customers c ON c.id=o.customer_id
        WHERE c.deleted_at IS NULL AND o.finance_review_status='pending'
        GROUP BY kind`).all(),
    ]);
    const daily=flows.results.map(row=>({day:String(row.day),sales:num(row.sales),collections:num(row.collections)}));
    const sales=daily.reduce((sum,row)=>sum+row.sales,0),collections=daily.reduce((sum,row)=>sum+row.collections,0),contractValue=num((contracts as Record<string,unknown>)?.value);
    const reviewBreakdown=Object.fromEntries(review.results.map(row=>[String(row.kind),num(row.count)]));
    const reviewCount=Object.values(reviewBreakdown).reduce((sum,count)=>sum+Number(count||0),0);
    finance={month,orders:num((contracts as Record<string,unknown>)?.orders),contractValue,sales,collections,cash:sales+collections,remaining:Math.max(contractValue-num((contractPayments as Record<string,unknown>)?.paid),0),target:num((target as Record<string,unknown>)?.target_amount),reviewCount,reviewBreakdown,daily};
  }
  return Response.json({
    user:{email:auth.email,name:account?.display_name||auth.email.split("@")[0],roles:auth.roles},
    canSeeFinance,canEditFinanceTarget:can(auth,"finance.total.edit"),
    operations:{pendingCustomers:num((pendingCustomers as Record<string,unknown>)?.count),customersToday:num((customers as Record<string,unknown>)?.count),totalCustomers:num((totalCustomers as Record<string,unknown>)?.count),activeReservations:num((reservations as Record<string,unknown>)?.count)},
    tasks:tasks.results.map(row=>({...row,department:row.department==="الأكاديمية"?"التشغيلية":row.department})),
    journey:journey.results,activity:activity.results,trainees:traineeGroups,finance,generatedAt:new Date().toISOString()
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
