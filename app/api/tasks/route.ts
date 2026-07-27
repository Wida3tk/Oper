import { authorize, can, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales","finance","academy","viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  const mine = new URL(req.url).searchParams.get("mine") === "1";
  const canSeeFinance = auth.roles.includes("admin") || auth.roles.includes("finance") || can(auth,"finance.view");
  const visibility = canSeeFinance ? "1=1" : "t.department!='المالية'";
  const effectivePriority="CASE WHEN t.due_at IS NOT NULL AND date(t.due_at)<=date('now','+3 hours') THEN 'عاجلة' WHEN t.due_at IS NOT NULL AND date(t.due_at)<=date('now','+3 hours','+1 day') THEN 'عالية' ELSE t.priority END";
  const details=`SELECT t.*,${effectivePriority} effective_priority,(CASE WHEN t.entity_type='enrollment' THEN (SELECT c.name FROM enrollments e JOIN customers c ON c.id=e.customer_id WHERE e.id=t.entity_id) WHEN t.entity_type='payment' THEN (SELECT c.name FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id WHERE p.id=t.entity_id) WHEN t.entity_type='reservation' THEN (SELECT c.name FROM seat_reservations r JOIN customers c ON c.id=r.customer_id WHERE r.id=t.entity_id) END) customer_name,(CASE WHEN t.entity_type='enrollment' THEN (SELECT pr.name FROM enrollments e JOIN programs pr ON pr.id=e.program_id WHERE e.id=t.entity_id) WHEN t.entity_type='payment' THEN (SELECT pr.name FROM payments p JOIN orders o ON o.id=p.order_id LEFT JOIN programs pr ON pr.id=o.program_id WHERE p.id=t.entity_id) WHEN t.entity_type='reservation' THEN (SELECT pr.name FROM seat_reservations r JOIN programs pr ON pr.id=r.program_id WHERE r.id=t.entity_id) END) program_name FROM workflow_tasks t`;
  const query = mine
    ? db.prepare(`${details} WHERE t.assignee_email=? AND t.status!='مكتملة' AND ${visibility} ORDER BY CASE ${effectivePriority} WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,t.due_at`).bind(auth.email)
    : db.prepare(`${details} WHERE t.status!='مكتملة' AND ${visibility} ORDER BY CASE ${effectivePriority} WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,t.due_at LIMIT 200`);
  const [{ results },completed]=await Promise.all([query.all(),db.prepare(`${details} WHERE t.status='مكتملة' AND date(t.completed_at)=date('now') AND ${visibility} ORDER BY t.completed_at DESC LIMIT 100`).all()]);
  const normalize=(rows:Record<string,unknown>[])=>rows.map(({effective_priority,...row})=>({...row,priority:effective_priority||row.priority}));
  return Response.json({ tasks: normalize(results as Record<string,unknown>[]), completedToday: normalize(completed.results as Record<string,unknown>[]), counts:{open:results.length,completedToday:completed.results.length} });
}

export async function POST(req: Request) {
  const auth = await authorize(req, ["sales","finance","academy"]);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string,unknown>;
  const taskId = String(body.taskId||"");
  const action = String(body.action||"");
  const db = operationalDb();
  const task = await db.prepare("SELECT * FROM workflow_tasks WHERE id=?").bind(taskId).first<Record<string,unknown>>();
  if (!task) return Response.json({error:"المهمة غير موجودة"},{status:404});
  if (task.department === "المالية" && !auth.roles.includes("admin") && !auth.roles.includes("finance") && !can(auth,"finance.view")) return Response.json({error:"هذه المهمة مخصصة للإدارة المالية"},{status:403});
  const now = new Date().toISOString();
  if (action === "complete") await db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE id=?").bind(now,taskId).run();
  else if (action === "assign") await db.prepare("UPDATE workflow_tasks SET assignee_email=?,status='مفتوحة' WHERE id=?").bind(String(body.assigneeEmail||auth.email).toLowerCase(),taskId).run();
  else if (action === "postpone") await db.prepare("UPDATE workflow_tasks SET due_at=?,status='مؤجلة' WHERE id=?").bind(String(body.dueAt||""),taskId).run();
  else return Response.json({error:"الإجراء غير صالح"},{status:400});
  await db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_TASK','workflow_task',?,?,?)").bind(id("AUD"),auth.email,taskId,JSON.stringify({action,dueAt:body.dueAt,assigneeEmail:body.assigneeEmail}),now).run();
  return Response.json({ok:true});
}
