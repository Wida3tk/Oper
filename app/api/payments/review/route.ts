import { authorize, id, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await authorize(req, ["finance"]);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const intentId = String(body.paymentIntentId || "");
  const decision = String(body.decision || "");
  if (!intentId || !["approve","reject"].includes(decision)) return Response.json({ error: "قرار المراجعة غير صالح" }, { status: 400 });
  const db = operationalDb();
  const intent = await db.prepare("SELECT pi.*,p.name,p.phone,p.email,pr.name program_name FROM payment_intents pi JOIN prospects p ON p.id=pi.prospect_id JOIN programs pr ON pr.id=pi.program_id WHERE pi.id=?").bind(intentId).first<Record<string, unknown>>();
  if (!intent) return Response.json({ error: "الدفعة غير موجودة" }, { status: 404 });
  if (intent.status !== "بانتظار المالية") return Response.json({ error: "تمت معالجة هذه الدفعة سابقاً" }, { status: 409 });
  const now = new Date().toISOString();
  if (decision === "reject") {
    const reason = String(body.reason || "").trim();
    if (!reason) return Response.json({ error: "سبب الرفض مطلوب" }, { status: 400 });
    await db.batch([
      db.prepare("UPDATE payment_intents SET status='مرفوض',reviewed_by_finance_email=?,reviewed_at=?,rejection_reason=?,updated_at=? WHERE id=?").bind(auth.email,now,reason,now,intentId),
      db.prepare("UPDATE prospects SET status='مرفوض مالياً',updated_at=? WHERE id=?").bind(now,intent.prospect_id),
      db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='payment_intent' AND entity_id=? AND status='مفتوحة'").bind(now,intentId),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'REJECT_PAYMENT','payment_intent',?,?,?)").bind(id("AUD"),auth.email,intentId,JSON.stringify({reason}),now),
    ]);
    return Response.json({ ok: true, status: "مرفوض" });
  }

  const existing = await db.prepare("SELECT id FROM customers WHERE phone=? OR email=? LIMIT 1").bind(intent.phone,intent.email).first<{id:string}>();
  const customerId = existing?.id || id("CUS");
  const orderId = id("ORD");
  const paymentId = id("PAY");
  const isReservation = intent.purchase_type === "حجز مقعد";
  const reservationId = isReservation ? id("RSV") : null;
  const enrollmentId = isReservation ? null : id("ENR");
  const statements = [];
  if (!existing) statements.push(db.prepare("INSERT INTO customers(id,name,phone,email,customer_type,admitted_via,admission_source_id,created_at,updated_at) VALUES(?,?,?,?,?,'دفعة معتمدة',?,?,?)").bind(customerId,intent.name,intent.phone,intent.email,isReservation?"صاحب حجز":"مسجل",intentId,now,now));
  statements.push(
    db.prepare("INSERT INTO orders(id,customer_id,order_type,program_id,program,track,delivery,language,purchase_source,payment_plan,total,paid,status,academy_status,owner,created_at,updated_at) VALUES(?,?,?,?,?,'غير محدد','غير محدد','العربية','طلب أولي','دفع كامل',?,?,'مدفوع',?,'غير مسند',?,?)").bind(orderId,customerId,intent.purchase_type,intent.program_id,intent.program_name,intent.amount,intent.amount,isReservation?"غير مطبق":"جديد",now,now),
    db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,proof_asset_key,created_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(paymentId,orderId,intent.amount,now,"معتمد",intent.method,intent.reference,intent.proof_asset_key,now)
  );
  if (isReservation) statements.push(
    db.prepare("INSERT INTO seat_reservations(id,customer_id,program_id,order_id,fee_amount,status,confirmed_at,created_at,updated_at) VALUES(?,?,?,?,?,'مؤكد',?,?,?)").bind(reservationId,customerId,intent.program_id,orderId,intent.amount,now,now,now),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'reservation',?,'المبيعات','متابعة حجز المقعد حتى فتح البرنامج','مفتوحة','عادية',?,?)").bind(id("TSK"),reservationId,auth.email,now)
  ); else statements.push(
    db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").bind(enrollmentId,customerId,intent.program_id,orderId,"جديد",now,now),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'الأكاديمية','التواصل مع العميل وبدء التسجيل','مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,auth.email,now)
  );
  statements.push(
    db.prepare("UPDATE payment_intents SET status='معتمد',reviewed_by_finance_email=?,reviewed_at=?,resulting_customer_id=?,resulting_order_id=?,updated_at=? WHERE id=?").bind(auth.email,now,customerId,orderId,now,intentId),
    db.prepare("UPDATE prospects SET status='تحول إلى عميل',converted_customer_id=?,updated_at=? WHERE id=?").bind(customerId,now,intent.prospect_id),
    db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='payment_intent' AND entity_id=? AND status='مفتوحة'").bind(now,intentId),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'APPROVE_PAYMENT','payment_intent',?,?,?)").bind(id("AUD"),auth.email,intentId,JSON.stringify({customerId,orderId,reservationId,enrollmentId}),now)
  );
  await db.batch(statements);
  return Response.json({ ok: true, status: "معتمد", customerId, orderId, reservationId, enrollmentId });
}
