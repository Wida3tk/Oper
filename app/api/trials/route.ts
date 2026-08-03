import { authorize, id, nextOrderNumber, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";

export async function GET(req:Request){
  const auth=await authorize(req,["sales","academy","viewer"]);
  if(!auth.ok)return auth.response;
  const {results}=await operationalDb().prepare(`
    SELECT t.id,t.customer_id,t.program_id,t.status,t.starts_at,t.ends_at,
           c.name customer_name,c.phone,c.email,p.name program_name,p.code program_code
    FROM program_trials t
    JOIN customers c ON c.id=t.customer_id
    JOIN programs p ON p.id=t.program_id
    WHERE t.status='فعالة' AND t.converted_order_id IS NULL
    ORDER BY t.ends_at,t.created_at
  `).all();
  return Response.json({trials:results});
}

export async function POST(req:Request){
  const auth=await authorize(req,["sales"]);
  if(!auth.ok)return auth.response;
  const body=await req.json() as Record<string,unknown>,trialId=String(body.trialId||""),action=String(body.action||"");
  if(!trialId||!["subscribe","not_interested"].includes(action))return Response.json({error:"الإجراء غير صالح"},{status:400});
  const db=operationalDb(),trial=await db.prepare("SELECT t.*,p.name program_name FROM program_trials t JOIN programs p ON p.id=t.program_id WHERE t.id=?").bind(trialId).first<Record<string,unknown>>();
  if(!trial||trial.status!=="فعالة"||trial.converted_order_id)return Response.json({error:"تمت معالجة تجربة العميل مسبقاً"},{status:409});
  const now=new Date().toISOString();
  if(action==="not_interested"){
    await db.batch([
      db.prepare("UPDATE program_trials SET status='مغلقة',outcome='غير مهتم',updated_at=? WHERE id=?").bind(now,trialId),
      db.prepare("UPDATE customers SET customer_type='غير مهتم',updated_at=? WHERE id=?").bind(now,trial.customer_id),
      db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='trial' AND entity_id=? AND status!='مكتملة'").bind(now,trialId),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'TRIAL_NOT_INTERESTED','trial',?,'{}',?)").bind(id("AUD"),auth.email,trialId,now)
    ]);
    return Response.json({ok:true,status:"غير مهتم"});
  }
  const orderId=id("ORD"),orderNumber=await nextOrderNumber(db,String(trial.program_name||"")),enrollmentId=id("ENR");
  await db.batch([
    db.prepare("INSERT INTO orders(id,order_number,customer_id,order_type,program_id,program,track,delivery,language,purchase_source,payment_plan,total,paid,status,academy_status,owner,created_at,updated_at) VALUES(?,?,?,'برنامج',?,?, 'غير محدد','مسجل','العربية','تحويل من تجربة','بانتظار تنظيم الاشتراك',0,0,'جديد','تم التواصل','غير مسند',?,?)").bind(orderId,orderNumber,trial.customer_id,trial.program_id,trial.program_name,now,now),
    db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,status,created_at,updated_at) VALUES(?,?,?,?, 'تم التواصل',?,?)").bind(enrollmentId,trial.customer_id,trial.program_id,orderId,now,now),
    db.prepare("UPDATE program_trials SET status='تم الاشتراك',outcome='اشتراك',converted_order_id=?,updated_at=? WHERE id=?").bind(orderId,now,trialId),
    db.prepare("UPDATE customers SET customer_type='مشترك',updated_at=? WHERE id=?").bind(now,trial.customer_id),
    db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='trial' AND entity_id=? AND status!='مكتملة'").bind(now,trialId),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'التشغيلية','تهيئة العميل واستكمال بياناته','مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,auth.email,now),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'TRIAL_SUBSCRIBED','enrollment',?,?,?)").bind(id("AUD"),auth.email,enrollmentId,JSON.stringify({trialId,orderId}),now)
  ]);
  return Response.json({ok:true,status:"تم الاشتراك",orderId,enrollmentId});
}
