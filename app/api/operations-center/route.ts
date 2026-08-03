import { authorize, can, operationalDb, promoteDueReservations } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await promoteDueReservations(db, auth.email);
  const canSeeFinance = auth.roles.includes("admin") || auth.roles.includes("finance") || can(auth, "finance.view");
  const financeFilter = canSeeFinance ? "" : "AND t.department!='المالية'";
  const [schedule, overdue, attention, incomplete] = await Promise.all([
    db.prepare(`SELECT r.id,r.assignment_date,r.start_date,r.reservation_kind,r.cohort_label,r.status,c.name customer_name,p.name program_name
      FROM seat_reservations r JOIN customers c ON c.id=r.customer_id JOIN programs p ON p.id=r.program_id
      WHERE r.converted_enrollment_id IS NULL AND r.status IN ('مؤكد','بانتظار البدء','بانتظار الإسناد')
      AND (date(r.assignment_date) BETWEEN date('now','+3 hours') AND date('now','+3 hours','+30 days')
        OR date(r.start_date) BETWEEN date('now','+3 hours') AND date('now','+3 hours','+30 days'))
      ORDER BY COALESCE(r.assignment_date,r.start_date),r.start_date LIMIT 100`).all(),
    db.prepare(`SELECT t.id,t.title,t.department,t.due_at,t.entity_type,
      CASE WHEN t.entity_type='enrollment' THEN (SELECT c.name FROM enrollments e JOIN customers c ON c.id=e.customer_id WHERE e.id=t.entity_id)
           WHEN t.entity_type='reservation' THEN (SELECT c.name FROM seat_reservations r JOIN customers c ON c.id=r.customer_id WHERE r.id=t.entity_id)
           WHEN t.entity_type='payment' THEN (SELECT c.name FROM payments py JOIN orders o ON o.id=py.order_id JOIN customers c ON c.id=o.customer_id WHERE py.id=t.entity_id) END customer_name
      FROM workflow_tasks t WHERE t.status!='مكتملة' AND t.due_at IS NOT NULL AND date(t.due_at)<date('now','+3 hours') ${financeFilter}
      ORDER BY t.due_at LIMIT 50`).all(),
    db.prepare(`SELECT DISTINCT 'policy-'||o.id id,c.name customer_name,p.name program_name,'تطبيق السياسة' title,'المالية' department,NULL due_at,'policy' entity_type
      FROM installments i JOIN orders o ON o.id=i.order_id JOIN customers c ON c.id=o.customer_id LEFT JOIN programs p ON p.id=o.program_id
      WHERE i.status='تطبيق السياسة' ORDER BY c.name LIMIT 50`).all(),
    db.prepare(`SELECT 'data-'||e.id id,c.name customer_name,p.name program_name,'بيانات العميل غير مكتملة' title,'التشغيلية' department,NULL due_at,'enrollment' entity_type
      FROM enrollments e JOIN customers c ON c.id=e.customer_id JOIN programs p ON p.id=e.program_id
      WHERE e.status!='مكتمل' AND (trim(COALESCE(c.phone,''))='' OR trim(COALESCE(c.email,''))='') ORDER BY e.updated_at LIMIT 50`).all(),
  ]);
  const exceptions = [
    ...overdue.results.map((row) => ({ ...row, kind: "overdue", severity: "red" })),
    ...(canSeeFinance ? attention.results.map((row) => ({ ...row, kind: "policy", severity: "red" })) : []),
    ...incomplete.results.map((row) => ({ ...row, kind: "data", severity: "amber" })),
  ];
  return Response.json({
    generatedAt: new Date().toISOString(),
    schedule: schedule.results,
    exceptions,
    stats: {
      upcoming: schedule.results.length,
      overdue: overdue.results.length,
      attention: canSeeFinance ? attention.results.length : 0,
      incomplete: incomplete.results.length,
    },
  });
}
