import { authorize, id, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

const transitions:Record<string,{from:string[],to:string,column?:string,next?:string}>={
  contacted:{from:["جديد"],to:"تم التواصل",next:"استكمال بيانات التسجيل"},
  registered:{from:["تم التواصل"],to:"اكتمل التسجيل",next:"إنشاء حساب المتعلم"},
  account_created:{from:["اكتمل التسجيل"],to:"تم إنشاء الحساب",column:"account_created_at",next:"إسناد البرنامج والمقررات"},
  assigned:{from:["تم إنشاء الحساب"],to:"تم الإسناد",column:"assigned_at",next:"التحقق من دخول المتعلم"},
  access_verified:{from:["تم الإسناد"],to:"نشط",column:"access_verified_at"},
  completed:{from:["نشط"],to:"مكتمل",column:"completed_at"},
};

export async function POST(req:Request){
  const auth=await authorize(req,["academy"]);if(!auth.ok)return auth.response;
  const body=await req.json() as Record<string,unknown>, enrollmentId=String(body.enrollmentId||""), action=String(body.action||"");
  const transition=transitions[action];if(!transition)return Response.json({error:"الانتقال غير صالح"},{status:400});
  const db=operationalDb();const enrollment=await db.prepare("SELECT status FROM enrollments WHERE id=?").bind(enrollmentId).first<{status:string}>();
  if(!enrollment)return Response.json({error:"التسجيل غير موجود"},{status:404});
  if(!transition.from.includes(enrollment.status))return Response.json({error:`لا يمكن تنفيذ الإجراء من حالة ${enrollment.status}`},{status:409});
  const now=new Date().toISOString(), column=transition.column?`,${transition.column}=?`:"";
  const update=transition.column?db.prepare(`UPDATE enrollments SET status=?,updated_at=?${column} WHERE id=?`).bind(transition.to,now,now,enrollmentId):db.prepare("UPDATE enrollments SET status=?,updated_at=? WHERE id=?").bind(transition.to,now,enrollmentId);
  const statements=[update,db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='enrollment' AND entity_id=? AND status!='مكتملة'").bind(now,enrollmentId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'ENROLLMENT_TRANSITION','enrollment',?,?,?)").bind(id("AUD"),auth.email,enrollmentId,JSON.stringify({from:enrollment.status,to:transition.to,action}),now)];
  if(transition.next)statements.splice(1,0,db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'الأكاديمية',?,'مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,transition.next,auth.email,now));
  await db.batch(statements);return Response.json({ok:true,status:transition.to});
}
