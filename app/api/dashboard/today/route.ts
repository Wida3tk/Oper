import { authorize, can, operationalDb, promoteDueReservations } from "../../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await promoteDueReservations(db,auth.email);
  const today = new Date().toISOString().slice(0, 10);
  const canSeeFinance = auth.roles.includes("admin") || auth.roles.includes("finance") || can(auth,"finance.view");
  const taskVisibility = canSeeFinance ? "1=1" : "department!='المالية'";
  const [tasks, customers, payments, enrollments] = await Promise.all([
    db.prepare(`SELECT id,title,department,priority,due_at,status FROM workflow_tasks WHERE status!='مكتملة' AND (assignee_email=? OR assignee_email IS NULL) AND ${taskVisibility} ORDER BY CASE priority WHEN 'عاجلة' THEN 0 WHEN 'عالية' THEN 1 ELSE 2 END,due_at LIMIT 8`).bind(auth.email).all(),
    db.prepare("SELECT COUNT(*) count FROM customers WHERE substr(created_at,1,10)=?").bind(today).first<{count:number}>(),
    db.prepare("SELECT COUNT(*) count,COALESCE(SUM(amount),0) amount FROM payments WHERE substr(created_at,1,10)=?").bind(today).first<{count:number;amount:number}>(),
    db.prepare("SELECT COUNT(*) count FROM enrollments WHERE status!='مكتمل'").first<{count:number}>(),
  ]);
  const account=await db.prepare("SELECT display_name FROM staff_accounts WHERE email=?").bind(auth.email).first<{display_name:string}>();
  const name = account?.display_name || auth.email.split("@")[0].replace(/[._-]+/g, " ");
  return Response.json({ user: { email: auth.email, name, roles: auth.roles }, today, stats: { tasks: tasks.results.length, customers: Number(customers?.count||0), payments: canSeeFinance?Number(payments?.count||0):0, paymentAmount: canSeeFinance?Number(payments?.amount||0):0, enrollments: Number(enrollments?.count||0) }, tasks: tasks.results, canSeeFinance });
}
