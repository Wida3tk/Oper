import { authorize, can, ensureOrderNumberSchema, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  await ensureOrderNumberSchema(operationalDb());

  const { results } = await operationalDb().prepare(`
    SELECT c.id,c.name,c.phone,c.email,c.customer_type,c.admitted_via,c.created_at,
           o.id order_id,o.order_number,o.program,o.track,o.delivery,o.purchase_source source,o.owner,
           o.academy_status state,o.status order_status,o.paid,o.total,o.cohort_label,o.scheduled_start_date,
           CASE WHEN o.seat_reservation=1 THEN COALESCE((SELECT MAX(r.fee_amount) FROM seat_reservations r WHERE r.order_id=o.id AND r.reservation_kind IN ('حجز مقعد','إشراف')),0) ELSE 0 END seat_fee,
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
    db.prepare(`UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE status!='مكتملة' AND (
      (entity_type='enrollment' AND entity_id IN (SELECT id FROM enrollments WHERE customer_id=?))
      OR (entity_type='reservation' AND entity_id IN (SELECT id FROM seat_reservations WHERE customer_id=?))
      OR (entity_type='payment' AND entity_id IN (SELECT p.id FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.customer_id=?))
      OR (entity_type='reservation_transfer' AND entity_id IN (
        SELECT rt.id FROM reservation_transfers rt JOIN seat_reservations r ON r.id=rt.from_reservation_id WHERE r.customer_id=?
      ))
    )`).bind(now, customerId, customerId, customerId, customerId),
    db.prepare("DELETE FROM payment_reviews WHERE payment_id IN (SELECT p.id FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.customer_id=?)").bind(customerId),
    db.prepare("DELETE FROM installments WHERE order_id IN (SELECT id FROM orders WHERE customer_id=?)").bind(customerId),
    db.prepare("DELETE FROM finance_notes WHERE order_id IN (SELECT id FROM orders WHERE customer_id=?)").bind(customerId),
    db.prepare("DELETE FROM attention_followups WHERE order_id IN (SELECT id FROM orders WHERE customer_id=?)").bind(customerId),
    db.prepare("DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id=?)").bind(customerId),
    db.prepare("DELETE FROM payment_intents WHERE resulting_customer_id=? OR resulting_order_id IN (SELECT id FROM orders WHERE customer_id=?)").bind(customerId, customerId),
    db.prepare("UPDATE seat_reservations SET fee_amount=0,status='ملغي',updated_at=? WHERE customer_id=?").bind(now, customerId),
    db.prepare("UPDATE orders SET total=0,paid=0,status='محذوف',finance_review_status='not_required',updated_at=? WHERE customer_id=?").bind(now, customerId),
    db.prepare("UPDATE customers SET deleted_at=?,updated_at=? WHERE id=? AND deleted_at IS NULL").bind(now, now, customerId),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'DELETE_CUSTOMER','customer',?,?,?)")
      .bind(id("AUD"), auth.email, customerId, JSON.stringify({ name: customer.name, mode: "soft-delete-with-financial-purge" }), now),
  ]);

  return Response.json({ ok: true });
}

export async function PATCH(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  if (!can(auth, "customers.manage")) return Response.json({ error: "ليس لديك صلاحية تعديل بيانات العملاء" }, { status: 403 });
  const body = await req.json() as Record<string, unknown>;
  const customerId = String(body.customerId || "").trim();
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").replace(/\s/g, "");
  const email = String(body.email || "").trim().toLowerCase();
  const source = String(body.source || "").trim();
  const cohort = String(body.cohort || "").trim();
  if (!customerId || !name || !phone || !email) return Response.json({ error: "الاسم والجوال والبريد مطلوبة" }, { status: 400 });
  const db = operationalDb();
  const current = await db.prepare(`SELECT c.id,c.name,c.phone,c.email,o.id order_id,o.purchase_source source,o.cohort_label cohort
    FROM customers c LEFT JOIN orders o ON o.id=(SELECT id FROM orders WHERE customer_id=c.id ORDER BY created_at DESC LIMIT 1)
    WHERE c.id=? AND c.deleted_at IS NULL`).bind(customerId).first<Record<string, unknown>>();
  if (!current) return Response.json({ error: "العميل غير موجود" }, { status: 404 });
  const changes: Record<string, { from: string; to: string }> = {};
  for (const [field, from, to] of [["name", current.name, name], ["phone", current.phone, phone], ["email", current.email, email], ["source", current.source, source], ["cohort", current.cohort, cohort]] as const) {
    if (String(from || "") !== to) changes[field] = { from: String(from || ""), to };
  }
  if (!Object.keys(changes).length) return Response.json({ ok: true, unchanged: true });
  const now = new Date().toISOString();
  const statements = [
    db.prepare("UPDATE customers SET name=?,phone=?,email=?,admitted_via=?,updated_at=? WHERE id=?").bind(name, phone, email, source, now, customerId),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_CUSTOMER_DATA','customer',?,?,?)").bind(id("AUD"), auth.email, customerId, JSON.stringify({ changes }), now),
  ];
  if (current.order_id) statements.splice(1, 0,
    db.prepare("UPDATE orders SET purchase_source=?,cohort_label=?,updated_at=? WHERE id=?").bind(source, cohort || null, now, current.order_id),
    db.prepare("UPDATE seat_reservations SET cohort_label=?,updated_at=? WHERE order_id=?").bind(cohort || null, now, current.order_id),
  );
  await db.batch(statements);
  return Response.json({ ok: true, customer: { id: customerId, name, phone, email, source, cohort }, changes });
}
