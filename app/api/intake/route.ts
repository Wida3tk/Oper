import { authorize, cleanContact, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  const { results } = await db.prepare("SELECT p.*,pr.name program_name,pi.id payment_intent_id,pi.amount,pi.method,pi.status payment_status FROM prospects p LEFT JOIN programs pr ON pr.id=p.intended_program_id LEFT JOIN payment_intents pi ON pi.prospect_id=p.id ORDER BY p.created_at DESC LIMIT 100").all();
  return Response.json({ prospects: results });
}

export async function POST(req: Request) {
  const auth = await authorize(req, ["sales"]);
  if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const mode = String(body.mode || "payment");
  const { name, phone, email } = cleanContact(body);
  const programId = String(body.programId || "");
  if (!name || !phone || !email || !programId) return Response.json({ error: "الاسم والجوال والبريد والبرنامج مطلوبة" }, { status: 400 });
  const db = operationalDb();
  const program = await db.prepare("SELECT id,name,default_trial_days trial_days FROM programs WHERE id=? AND active=1").bind(programId).first<{ id: string; name: string; trial_days: number }>();
  if (!program) return Response.json({ error: "البرنامج غير متاح" }, { status: 404 });
  const now = new Date().toISOString();
  const prospectId = id("PRO");

  if (mode === "trial") {
    if (program.trial_days < 1) return Response.json({ error: "يجب تحديد مدة تجربة لهذا البرنامج أولاً" }, { status: 409 });
    const existing = await db.prepare("SELECT id FROM customers WHERE phone=? OR email=? LIMIT 1").bind(phone, email).first<{ id: string }>();
    const customerId = existing?.id || id("CUS");
    const trialId = id("TRY");
    const endsAt = new Date(Date.now() + program.trial_days * 86400000).toISOString();
    const statements = [
      db.prepare("INSERT INTO prospects(id,name,phone,email,intended_program_id,status,created_by_email,converted_customer_id,created_at,updated_at) VALUES(?,?,?,?,?,'تحول إلى تجربة',?,?,?,?)").bind(prospectId,name,phone,email,programId,auth.email,customerId,now,now),
      db.prepare("INSERT INTO program_trials(id,customer_id,program_id,status,starts_at,ends_at,granted_by_sales_email,created_at,updated_at) VALUES(?,?,?,'فعالة',?,?,?,?,?)").bind(trialId,customerId,programId,now,endsAt,auth.email,now,now),
      db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,assignee_email,due_at,created_by_email,created_at) VALUES(?,'trial',?,'المبيعات','متابعة التجربة قبل انتهائها','مفتوحة','عالية',?,?,?,?)").bind(id("TSK"),trialId,auth.email,endsAt,auth.email,now),
      db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'GRANT_TRIAL','trial',?,?,?)").bind(id("AUD"),auth.email,trialId,JSON.stringify({programId,days:program.trial_days}),now),
    ];
    if (!existing) statements.splice(1,0,db.prepare("INSERT INTO customers(id,name,phone,email,customer_type,admitted_via,admission_source_id,created_at,updated_at) VALUES(?,?,?,?,?,'تجربة',?,?,?)").bind(customerId,name,phone,email,"تجربة",trialId,now,now));
    await db.batch(statements);
    return Response.json({ ok: true, prospectId, customerId, trialId, endsAt }, { status: 201 });
  }

  const amount = Number(body.amount || 0);
  const method = String(body.method || "تحويل بنكي");
  const purchaseType = String(body.purchaseType || "برنامج");
  if (!(amount > 0)) return Response.json({ error: "المبلغ مطلوب" }, { status: 400 });
  const intentId = id("PAYI");
  await db.batch([
    db.prepare("INSERT INTO prospects(id,name,phone,email,intended_program_id,status,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,'بانتظار المالية',?,?,?)").bind(prospectId,name,phone,email,programId,auth.email,now,now),
    db.prepare("INSERT INTO payment_intents(id,prospect_id,program_id,purchase_type,amount,method,reference,proof_asset_key,status,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(intentId,prospectId,programId,purchaseType,amount,method,String(body.reference||""),String(body.proofAssetKey||""),method==="تحويل بنكي"?"بانتظار المالية":"مدفوع",auth.email,now,now),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'payment_intent',?,'المالية','مراجعة الدفعة وتفعيل العميل','مفتوحة','عالية',?,?)").bind(id("TSK"),intentId,auth.email,now),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'CREATE_PAYMENT_INTENT','payment_intent',?,?,?)").bind(id("AUD"),auth.email,intentId,JSON.stringify({programId,purchaseType,amount,method}),now),
  ]);
  return Response.json({ ok: true, prospectId, paymentIntentId: intentId, status: method==="تحويل بنكي"?"بانتظار المالية":"مدفوع" }, { status: 201 });
}
