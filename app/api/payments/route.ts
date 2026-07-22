import { authorize, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await authorize(req, ["sales", "finance"]);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const orderId = String(body.orderId || "").trim();
  const amount = Number(body.amount || 0);
  const method = String(body.method || "").trim();
  if (!orderId || !Number.isFinite(amount) || amount <= 0 || !method) {
    return Response.json({ error: "رقم الطلب والمبلغ ووسيلة الدفع مطلوبة" }, { status: 400 });
  }

  const db = operationalDb();
  const order = await db.prepare("SELECT id,paid,total FROM orders WHERE id=?").bind(orderId).first<{id:string;paid:number;total:number}>();
  if (!order) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });

  const now = new Date().toISOString();
  const paymentId = id("PAY");
  const newPaid = Number(order.paid || 0) + amount;
  const orderStatus = newPaid >= Number(order.total || 0) ? "مدفوع" : "مدفوع جزئياً";
  await db.batch([
    db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,proof_asset_key,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .bind(paymentId, orderId, amount, now, "مسجلة", method, String(body.reference || ""), String(body.proofAssetKey || ""), now),
    db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(newPaid, orderStatus, now, orderId),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'payment',?,'المالية','مطابقة وتنظيم دفعة مسجلة','مفتوحة','عادية',?,?)")
      .bind(id("TSK"), paymentId, auth.email, now),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'RECORD_PAYMENT','payment',?,?,?)")
      .bind(id("AUD"), auth.email, paymentId, JSON.stringify({ orderId, amount, method }), now),
  ]);
  return Response.json({ ok: true, paymentId, orderId, paid: newPaid, status: orderStatus }, { status: 201 });
}
