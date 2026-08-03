import { authorize, can, id, operationalDb, promoteDueReservations } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await promoteDueReservations(db, auth.email);
  const canSeeFinance = auth.roles.includes("admin") || auth.roles.includes("finance") || can(auth, "finance.view");
  const canTakeAttentionAction = auth.roles.includes("academy");
  const financeFilter = canSeeFinance ? "" : "AND t.department!='المالية'";
  const [schedule, events, overdue, attention, incomplete] = await Promise.all([
    db.prepare(`SELECT r.id,r.assignment_date,r.start_date,r.reservation_kind,r.cohort_label,r.status,c.name customer_name,p.name program_name
      FROM seat_reservations r JOIN customers c ON c.id=r.customer_id JOIN programs p ON p.id=r.program_id
      WHERE r.converted_enrollment_id IS NULL AND r.status IN ('مؤكد','بانتظار البدء','بانتظار الإسناد')
      AND (date(r.assignment_date) BETWEEN date('now','+3 hours') AND date('now','+3 hours','+30 days')
        OR date(r.start_date) BETWEEN date('now','+3 hours') AND date('now','+3 hours','+30 days'))
      ORDER BY COALESCE(r.assignment_date,r.start_date),r.start_date LIMIT 100`).all(),
    db.prepare("SELECT * FROM team_events WHERE date(event_date) BETWEEN date('now','+3 hours') AND date('now','+3 hours','+90 days') ORDER BY event_date,event_time LIMIT 200").all<Record<string, unknown>>(),
    db.prepare(`SELECT t.id,t.title,t.department,t.due_at,t.entity_type,
      CASE WHEN t.entity_type='enrollment' THEN (SELECT c.name FROM enrollments e JOIN customers c ON c.id=e.customer_id WHERE e.id=t.entity_id)
           WHEN t.entity_type='reservation' THEN (SELECT c.name FROM seat_reservations r JOIN customers c ON c.id=r.customer_id WHERE r.id=t.entity_id)
           WHEN t.entity_type='payment' THEN (SELECT c.name FROM payments py JOIN orders o ON o.id=py.order_id JOIN customers c ON c.id=o.customer_id WHERE py.id=t.entity_id) END customer_name
      FROM workflow_tasks t WHERE t.status!='مكتملة' AND t.due_at IS NOT NULL AND date(t.due_at)<date('now','+3 hours') ${financeFilter}
      ORDER BY t.due_at LIMIT 50`).all(),
    db.prepare(`SELECT 'policy-'||o.id id,o.id order_id,c.name customer_name,p.name program_name,'تطبيق السياسة' title,'المالية' department,NULL due_at,'policy' entity_type,
      COALESCE(f.state,'needs_operations') attention_state,f.first_action_by_email,f.first_action_at,f.finance_action_by_email,f.finance_action_at
      FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN programs p ON p.id=o.program_id LEFT JOIN attention_followups f ON f.order_id=o.id
      WHERE (EXISTS(SELECT 1 FROM installments i WHERE i.order_id=o.id AND i.status='تطبيق السياسة') OR f.state IN ('needs_operations','waiting_finance','finance_resolved'))
      AND COALESCE(f.state,'needs_operations')!='closed' ORDER BY c.name LIMIT 50`).all(),
    db.prepare(`SELECT 'data-'||e.id id,c.name customer_name,p.name program_name,'بيانات العميل غير مكتملة' title,'التشغيلية' department,NULL due_at,'enrollment' entity_type
      FROM enrollments e JOIN customers c ON c.id=e.customer_id JOIN programs p ON p.id=e.program_id
      WHERE e.status!='مكتمل' AND (trim(COALESCE(c.phone,''))='' OR trim(COALESCE(c.email,''))='') ORDER BY e.updated_at LIMIT 50`).all(),
  ]);
  const exceptions = [
    ...overdue.results.map((row) => ({ ...row, kind: "overdue", severity: "red" })),
    ...attention.results.map((row) => ({ ...row, kind: "policy", severity: row.attention_state === "finance_resolved" ? "green" : "red" })),
    ...incomplete.results.map((row) => ({ ...row, kind: "data", severity: "amber" })),
  ];
  const visibleEvents = events.results.filter((row) => {
    const audience = String(row.audience || "all").split(",");
    return auth.roles.includes("admin") || audience.includes("all") || auth.roles.some((role) => audience.includes(role));
  });
  return Response.json({
    generatedAt: new Date().toISOString(),
    schedule: schedule.results,
    events: visibleEvents,
    exceptions,
    canManageEvents: auth.roles.includes("admin"),
    canTakeAttentionAction,
    stats: {
      upcoming: schedule.results.length + visibleEvents.length,
      overdue: overdue.results.length,
      attention: attention.results.length,
      incomplete: incomplete.results.length,
    },
  });
}

export async function POST(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  if (String(body.action || "") === "take_attention_action") {
    if (!auth.roles.includes("academy")) return Response.json({ error: "تسجيل الإجراء متاح لفريق التشغيل فقط" }, { status: 403 });
    const orderId = String(body.orderId || ""), db = operationalDb(), now = new Date().toISOString();
    if (!orderId) return Response.json({ error: "ملف العميل غير محدد" }, { status: 400 });
    const followup = await db.prepare("SELECT state FROM attention_followups WHERE order_id=?").bind(orderId).first<{ state: string }>();
    const hasPolicy = await db.prepare("SELECT 1 found FROM installments WHERE order_id=? AND status='تطبيق السياسة' LIMIT 1").bind(orderId).first();
    const state = followup?.state || (hasPolicy ? "needs_operations" : "");
    if (state === "needs_operations") {
      await db.batch([
        db.prepare("INSERT INTO attention_followups(order_id,state,first_action_by_email,first_action_at,updated_at) VALUES(?,'waiting_finance',?,?,?) ON CONFLICT(order_id) DO UPDATE SET state='waiting_finance',first_action_by_email=excluded.first_action_by_email,first_action_at=excluded.first_action_at,updated_at=excluded.updated_at").bind(orderId, auth.email, now, now),
        db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'ATTENTION_OPERATIONAL_ACTION','order',?,'{\"stage\":\"first\"}',?)").bind(id("AUD"), auth.email, orderId, now),
      ]);
      return Response.json({ ok: true, state: "waiting_finance" });
    }
    if (state === "finance_resolved") {
      await db.batch([
        db.prepare("UPDATE attention_followups SET state='closed',final_action_by_email=?,final_action_at=?,updated_at=? WHERE order_id=?").bind(auth.email, now, now, orderId),
        db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'ATTENTION_OPERATIONAL_ACTION','order',?,'{\"stage\":\"final\"}',?)").bind(id("AUD"), auth.email, orderId, now),
      ]);
      return Response.json({ ok: true, state: "closed" });
    }
    return Response.json({ error: state === "waiting_finance" ? "الحالة بانتظار تحديث المالية" : "لا توجد متابعة تشغيلية متاحة" }, { status: 409 });
  }
  if (!auth.roles.includes("admin")) return Response.json({ error: "هذه الخاصية متاحة للإدارة فقط" }, { status: 403 });
  const title = String(body.title || "").trim(), eventDate = String(body.eventDate || ""), eventTime = String(body.eventTime || ""), details = String(body.details || "").trim();
  const audience = Array.isArray(body.audience) ? body.audience.map(String).filter(Boolean).join(",") : "all";
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return Response.json({ error: "اسم الموعد والتاريخ مطلوبان" }, { status: 400 });
  const now = new Date().toISOString(), eventId = String(body.id || id("EVT"));
  await operationalDb().prepare(`INSERT INTO team_events(id,title,event_date,event_time,details,audience,created_by_email,created_at,updated_at)
    VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,event_date=excluded.event_date,event_time=excluded.event_time,details=excluded.details,audience=excluded.audience,updated_at=excluded.updated_at`)
    .bind(eventId, title, eventDate, eventTime || null, details || null, audience || "all", auth.email, now, now).run();
  return Response.json({ ok: true, id: eventId });
}

export async function DELETE(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  if (!auth.roles.includes("admin")) return Response.json({ error: "هذه الخاصية متاحة للإدارة فقط" }, { status: 403 });
  const eventId = new URL(req.url).searchParams.get("id") || "";
  if (!eventId) return Response.json({ error: "الموعد غير محدد" }, { status: 400 });
  await operationalDb().prepare("DELETE FROM team_events WHERE id=?").bind(eventId).run();
  return Response.json({ ok: true });
}
