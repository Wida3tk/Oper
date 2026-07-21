import { authorize, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales","finance","academy","viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  const mine = new URL(req.url).searchParams.get("mine") === "1";
  const query = mine
    ? db.prepare("SELECT * FROM workflow_tasks WHERE assignee_email=? AND status!='مكتملة' ORDER BY CASE priority WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,due_at").bind(auth.email)
    : db.prepare("SELECT * FROM workflow_tasks WHERE status!='مكتملة' ORDER BY CASE priority WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,due_at LIMIT 200");
  const { results } = await query.all();
  return Response.json({ tasks: results });
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
  const now = new Date().toISOString();
  if (action === "complete") await db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE id=?").bind(now,taskId).run();
  else if (action === "assign") await db.prepare("UPDATE workflow_tasks SET assignee_email=?,status='مفتوحة' WHERE id=?").bind(String(body.assigneeEmail||auth.email).toLowerCase(),taskId).run();
  else if (action === "postpone") await db.prepare("UPDATE workflow_tasks SET due_at=?,status='مؤجلة' WHERE id=?").bind(String(body.dueAt||""),taskId).run();
  else return Response.json({error:"الإجراء غير صالح"},{status:400});
  await db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_TASK','workflow_task',?,?,?)").bind(id("AUD"),auth.email,taskId,JSON.stringify({action,dueAt:body.dueAt,assigneeEmail:body.assigneeEmail}),now).run();
  return Response.json({ok:true});
}
