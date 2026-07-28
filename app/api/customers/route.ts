import { authorize, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;

  const { results } = await operationalDb().prepare(`
    SELECT c.id,c.name,c.phone,c.email,c.customer_type,c.admitted_via,c.created_at,
           o.id order_id,o.program,o.track,o.purchase_source source,o.owner,
           o.academy_status state,o.status order_status,o.paid,o.total,o.cohort_label,o.scheduled_start_date,
           p.name program_name
    FROM customers c
    LEFT JOIN orders o ON o.id=(
      SELECT o2.id FROM orders o2 WHERE o2.customer_id=c.id
      ORDER BY o2.created_at DESC LIMIT 1
    )
    LEFT JOIN programs p ON p.id=o.program_id
    WHERE c.deleted_at IS NULL
    ORDER BY c.created_at DESC
    LIMIT 500
  `).all<Record<string, unknown>>();

  const viewerOnly = auth.roles.includes("viewer") && !auth.roles.some((role) => ["admin", "sales", "finance", "academy"].includes(role));
  const customers = results.map((row) => viewerOnly ? { ...row, phone: null, email: null } : row);
  return Response.json({ customers });
}

export async function DELETE(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  if (!auth.roles.includes("admin")) {
    return Response.json({ error: "حذف العملاء متاح لحساب الإدارة فقط" }, { status: 403 });
  }

  const body = await req.json() as Record<string, unknown>;
  const customerId = String(body.customerId || "").trim();
  if (!customerId) return Response.json({ error: "معرّف العميل مطلوب" }, { status: 400 });

  const db = operationalDb();
  const customer = await db.prepare("SELECT id,name,deleted_at FROM customers WHERE id=?").bind(customerId).first<{id:string;name:string;deleted_at:string|null}>();
  if (!customer || customer.deleted_at) return Response.json({ error: "العميل غير موجود أو محذوف مسبقًا" }, { status: 404 });

  const now = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE customers SET deleted_at=?,updated_at=? WHERE id=? AND deleted_at IS NULL").bind(now, now, customerId),
    db.prepare(`UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE status!='مكتملة' AND (
      (entity_type='enrollment' AND entity_id IN (SELECT id FROM enrollments WHERE customer_id=?))
      OR (entity_type='reservation' AND entity_id IN (SELECT id FROM seat_reservations WHERE customer_id=?))
      OR (entity_type='payment' AND entity_id IN (SELECT p.id FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.customer_id=?))
      OR (entity_type='reservation_transfer' AND entity_id IN (
        SELECT rt.id FROM reservation_transfers rt JOIN seat_reservations r ON r.id=rt.from_reservation_id WHERE r.customer_id=?
      ))
    )`).bind(now, customerId, customerId, customerId, customerId),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'DELETE_CUSTOMER','customer',?,?,?)")
      .bind(id("AUD"), auth.email, customerId, JSON.stringify({ name: customer.name, mode: "soft-delete" }), now),
  ]);

  return Response.json({ ok: true });
}
