import { authorize, cleanContact, ensureDirectProgramSchema, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await ensureDirectProgramSchema(db);
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
  const track=String(body.track||"").trim(),delivery=String(body.delivery||"").trim(),language=String(body.language||"").trim(),cohort=String(body.cohort||"").trim(),startDate=String(body.startDate||"").trim(),assignmentDate=String(body.assignmentDate||"").trim();
  if(!delivery||!language)return Response.json({error:"نمط البرنامج واللغة مطلوبان"},{status:400});
  const db = operationalDb();
  const program = await db.prepare("SELECT id,name,program_kind kind,default_trial_days trial_days FROM programs WHERE id=? AND active=1").bind(programId).first<{ id: string; name: string; kind:string; trial_days: number }>();
  if (!program) return Response.json({ error: "البرنامج غير متاح" }, { status: 404 });
  const isDirectProgram=program.kind==="برنامج مباشر";
  if(isDirectProgram&&(!cohort||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(assignmentDate)))return Response.json({error:"اسم الدفعة وتاريخ البدء وتاريخ الإسناد مطلوبة للبرنامج المباشر"},{status:400});
  if(isDirectProgram&&assignmentDate>startDate)return Response.json({error:"تاريخ الإسناد يجب أن يكون في تاريخ بدء البرنامج أو قبله"},{status:400});
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
  const isReservation=purchaseType==="حجز مقعد";
  const isScheduled=isReservation||isDirectProgram;
  if(isReservation&&(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(assignmentDate)))return Response.json({error:"تاريخ بدء البرنامج وتاريخ الإسناد مطلوبان لحجز المقعد"},{status:400});
  if(isReservation&&assignmentDate>startDate)return Response.json({error:"تاريخ الإسناد يجب أن يكون في تاريخ بدء البرنامج أو قبله"},{status:400});
  if (!(amount > 0)) return Response.json({ error: "المبلغ مطلوب" }, { status: 400 });
  const intentId = id("PAYI");
  const existing = await db.prepare("SELECT id FROM customers WHERE phone=? OR email=? LIMIT 1").bind(phone,email).first<{id:string}>();
  const customerId=existing?.id||id("CUS"),orderId=id("ORD"),paymentId=id("PAY"),reservationId=isScheduled?id("RSV"):null,enrollmentId=isScheduled?null:id("ENR");
  const statements=[];
  statements.push(db.prepare("INSERT INTO prospects(id,name,phone,email,intended_program_id,status,created_by_email,converted_customer_id,created_at,updated_at) VALUES(?,?,?,?,?,'تحول إلى عميل',?,?,?,?)").bind(prospectId,name,phone,email,programId,auth.email,customerId,now,now));
  if(!existing)statements.push(db.prepare("INSERT INTO customers(id,name,phone,email,customer_type,admitted_via,admission_source_id,created_at,updated_at) VALUES(?,?,?,?,?,'دفعة مسجلة',?,?,?)").bind(customerId,name,phone,email,isReservation?"صاحب حجز":isDirectProgram?"برنامج مباشر":"مسجل",intentId,now,now));
  statements.push(
    db.prepare("INSERT INTO orders(id,customer_id,order_type,program_id,program,track,delivery,language,purchase_source,payment_plan,total,paid,status,academy_status,owner,cohort_label,scheduled_start_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'دفع كامل',?,?,'مدفوع',?,'غير مسند',?,?,?,?)").bind(orderId,customerId,purchaseType,programId,program.name,track||"غير محدد",delivery,language,String(body.source||"طلب أولي"),amount,amount,isScheduled?"غير مطبق":"تم التواصل",isScheduled?cohort:null,isScheduled?startDate:null,now,now),
    db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,proof_asset_key,created_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(paymentId,orderId,amount,now,"مسجلة",method,String(body.reference||""),String(body.proofAssetKey||""),now),
    db.prepare("INSERT INTO payment_intents(id,prospect_id,program_id,purchase_type,amount,method,reference,proof_asset_key,status,resulting_customer_id,resulting_order_id,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(intentId,prospectId,programId,purchaseType,amount,method,String(body.reference||""),String(body.proofAssetKey||""),"مسجلة",customerId,orderId,auth.email,now,now),
    db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'payment',?,'المالية','مطابقة وتنظيم الدفعة','مفتوحة','عادية',?,?)").bind(id("TSK"),paymentId,auth.email,now)
  );
  if(isScheduled)statements.push(db.prepare("INSERT INTO seat_reservations(id,customer_id,program_id,order_id,fee_amount,reservation_kind,status,cohort_label,start_date,assignment_date,confirmed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,'بانتظار الإسناد',?,?,?,?,?,?)").bind(reservationId,customerId,programId,orderId,amount,isReservation?"حجز مقعد":"برنامج مباشر",cohort||null,startDate,assignmentDate,now,now,now),db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,due_at,created_by_email,created_at) VALUES(?,'reservation',?,'المبيعات',?,'مفتوحة','عادية',?,?,?)").bind(id("TSK"),reservationId,isReservation?"متابعة حجز المقعد حتى تاريخ الإسناد":"متابعة البرنامج المباشر حتى تاريخ الإسناد",assignmentDate,auth.email,now));
  else statements.push(db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").bind(enrollmentId,customerId,programId,orderId,"تم التواصل",now,now),db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'الأكاديمية','تهيئة العميل واستكمال بياناته','مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,auth.email,now));
  statements.push(db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'RECORD_PAYMENT_AND_ADMIT','payment',?,?,?)").bind(id("AUD"),auth.email,paymentId,JSON.stringify({programId,purchaseType,amount,method,customerId,orderId}),now));
  await db.batch(statements);
  return Response.json({ok:true,prospectId,paymentIntentId:intentId,customerId,orderId,reservationId,enrollmentId,status:"تم إنشاء العميل"},{status:201});
}
