import { authorize, cleanContact, ensureDirectProgramSchema, ensureFinanceClassificationSchema, id, nextOrderNumber, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  await ensureFinanceClassificationSchema(db);
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
  if(!/^00[1-9]\d{8,14}$/.test(phone))return Response.json({error:"رقم الجوال يجب أن يبدأ بمفتاح الدولة، مثال: 009665xxxxxxxx"},{status:400});
  const journey=String(body.journey||"اشتراك");
  const track=String(body.track||"").trim(),requestedDelivery=String(body.delivery||"").trim(),requestedLanguage=String(body.language||"").trim(),cohort=String(body.cohort||"").trim(),startDate=String(body.startDate||"").trim(),assignmentDate=String(body.assignmentDate||"").trim();
  const db = operationalDb();
  await ensureFinanceClassificationSchema(db);
  await ensureDirectProgramSchema(db);
  const program = await db.prepare("SELECT id,name,program_kind kind,default_trial_days trial_days FROM programs WHERE id=? AND active=1").bind(programId).first<{ id: string; name: string; kind:string; trial_days: number }>();
  if (!program) return Response.json({ error: "البرنامج غير متاح" }, { status: 404 });
  const isSupervision=program.name.includes("الإشراف"),isCompetencyService=program.name.includes("تقييم الكفاءة"),isStandaloneService=isSupervision||isCompetencyService;
  const delivery=isSupervision?"مباشر":isCompetencyService?"خدمة":requestedDelivery,language=isStandaloneService?"":requestedLanguage;
  if(!isStandaloneService&&!delivery)return Response.json({error:"نمط البرنامج مطلوب"},{status:400});
  if(isStandaloneService&&mode==="trial")return Response.json({error:"الخدمات المستقلة لا تدعم نوع التجربة"},{status:400});
  if(!isStandaloneService&&!["اشتراك","تجربة"].includes(journey))return Response.json({error:"نوع الاشتراك غير صالح"},{status:400});
  const isObm=program.name.includes("إدارة السلوك التنظيمي");
  if(isObm&&!isSupervision&&!language)return Response.json({error:"اللغة مطلوبة لبرنامج إدارة السلوك التنظيمي"},{status:400});
  const orderLanguage=isObm?language:"";
  const isAbat=program.name.includes("تحليل السلوك التطبيقي")&&track.toUpperCase()==="ABAT";
  const competencyAssessment=body.competencyAssessment===true;
  if(competencyAssessment&&!isAbat)return Response.json({error:"إضافة تقييم الكفاءة متاحة فقط لمسار ABAT"},{status:400});
  const source = String(body.source || "عصارة"),isAsara=source==="عصارة";
  const isDirectProgram=isSupervision||(!isCompetencyService&&delivery==="مباشر");
  const seatReservationEligible=isSupervision||(delivery==="مباشر"&&["تحليل السلوك التطبيقي","إدارة السلوك التنظيمي"].some(name=>program.name.includes(name)));
  const hasSeatReservation=body.seatReserved===true&&seatReservationEligible;
  const autoAsara=isAsara&&!isSupervision&&!hasSeatReservation;
  if(hasSeatReservation&&!seatReservationEligible)return Response.json({error:"حجز المقعد متاح فقط للبرامج المؤهلة بالنمط المباشر"},{status:400});
  if((!isAsara&&isDirectProgram)||isSupervision||hasSeatReservation){
   if(!cohort||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(assignmentDate))return Response.json({error:"اسم الدفعة وتاريخ البدء وتاريخ الإسناد مطلوبة للبرنامج المباشر"},{status:400});
   if(assignmentDate>startDate)return Response.json({error:"تاريخ الإسناد يجب أن يكون في تاريخ بدء البرنامج أو قبله"},{status:400});
  }
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

  const paymentPlan = String(body.payment || "دفع كامل");
  const baseTotal = Math.round(Number(body.baseTotal || 0) * 100) / 100;
  const discountPercent = Number(body.discountPercent || 0);
  if(![0,5,10,15,20,25,30,35,40,45,50].includes(discountPercent))return Response.json({error:"نسبة الخصم غير صالحة"},{status:400});
  const discountedProgramTotal = Math.round(baseTotal*(1-discountPercent/100)*100)/100;
  const seatFee = hasSeatReservation ? (isSupervision?50:Math.round(Number(body.seatFee || 0)*100)/100) : 0;
  if(hasSeatReservation&&!(seatFee>0))return Response.json({error:"مبلغ حجز المقعد مطلوب"},{status:400});
  // Seat reservation fees are paid and reported separately; they never enter
  // the program contract, discount, remaining balance, or installment schedule.
  const contractTotal = discountedProgramTotal;
  const amount = paymentPlan === "أقساط"
    ? Math.round(Number(body.amount || 0)*100)/100
    : contractTotal;
  if(!["عصارة","سلة","دفع مباشر"].includes(source))return Response.json({error:"مصدر الدفع غير صالح"},{status:400});
  const method = source === "دفع مباشر"
    ? String(body.method || "تحويل بنكي")
    : source;
  if(source==="دفع مباشر"&&!["تحويل بنكي","تمارا","Paytabs"].includes(method))return Response.json({error:"وسيلة الدفع المباشر غير صالحة"},{status:400});
  const reference=String(body.reference||"").trim();
  if(source==="دفع مباشر"&&method==="Paytabs"&&!/^https?:\/\/\S+$/i.test(reference))return Response.json({error:"رابط مرجع السداد من Paytabs مطلوب"},{status:400});
  const proofAssetKey = String(body.proofAssetKey || "");
  if (source==="دفع مباشر"&&method === "تحويل بنكي") {
    if (!proofAssetKey.startsWith("data:image/")) return Response.json({error:"صورة التحويل البنكي مطلوبة"},{status:400});
    if (proofAssetKey.length > 1_500_000) return Response.json({error:"حجم صورة التحويل يتجاوز الحد المسموح"},{status:413});
  }
  const purchaseType = String(body.purchaseType || "برنامج");
  const isReservation=purchaseType==="حجز مقعد";
  const isScheduled=isSupervision||hasSeatReservation||(!isAsara&&(isReservation||isDirectProgram));
  if(!isAsara&&isReservation&&(!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(assignmentDate)))return Response.json({error:"تاريخ بدء البرنامج وتاريخ الإسناد مطلوبان لحجز المقعد"},{status:400});
  if(!isAsara&&isReservation&&assignmentDate>startDate)return Response.json({error:"تاريخ الإسناد يجب أن يكون في تاريخ بدء البرنامج أو قبله"},{status:400});
  if(hasSeatReservation&&(!cohort||!/^\d{4}-\d{2}-\d{2}$/.test(startDate)||!/^\d{4}-\d{2}-\d{2}$/.test(assignmentDate)))return Response.json({error:"اسم الدفعة وتاريخ البدء وتاريخ الإسناد مطلوبة لحجز المقعد"},{status:400});
  if(hasSeatReservation&&assignmentDate>startDate)return Response.json({error:"تاريخ الإسناد يجب أن يكون في تاريخ بدء البرنامج أو قبله"},{status:400});
  if (!(baseTotal > 0) || !(contractTotal > 0)) return Response.json({ error: "المبلغ الأساسي مطلوب" }, { status: 400 });
  if (!(amount > 0)) return Response.json({ error: "المبلغ المدفوع مطلوب" }, { status: 400 });
  if (paymentPlan === "أقساط" && (!(contractTotal > amount))) return Response.json({ error: "إجمالي قيمة العقد يجب أن يكون أكبر من الدفعة الأولى عند اختيار الأقساط" }, { status: 400 });
  const needsFinanceReview =
    isSupervision || paymentPlan === "أقساط" ||
    (source === "دفع مباشر" && ["تحويل بنكي", "Paytabs"].includes(method));
  const financeReviewStatus = needsFinanceReview ? "pending" : "approved";
  const classificationStatus = needsFinanceReview ? "pending" : "confirmed";
  const paymentIntentStatus = needsFinanceReview ? "بانتظار مراجعة المالية" : "مكتملة";
  const intentId = id("PAYI");
  const existing = await db.prepare("SELECT id FROM customers WHERE phone=? OR email=? LIMIT 1").bind(phone,email).first<{id:string}>();
  const customerId=existing?.id||id("CUS"),orderId=id("ORD"),orderNumber=await nextOrderNumber(db,program.name),paymentId=id("PAY"),reservationId=isScheduled?id("RSV"):null,enrollmentId=isScheduled?null:id("ENR");
  const statements=[];
  statements.push(db.prepare("INSERT INTO prospects(id,name,phone,email,intended_program_id,status,created_by_email,converted_customer_id,created_at,updated_at) VALUES(?,?,?,?,?,'تحول إلى عميل',?,?,?,?)").bind(prospectId,name,phone,email,programId,auth.email,customerId,now,now));
  if(!existing)statements.push(db.prepare("INSERT INTO customers(id,name,phone,email,customer_type,admitted_via,admission_source_id,created_at,updated_at) VALUES(?,?,?,?,?,'دفعة مسجلة',?,?,?)").bind(customerId,name,phone,email,isSupervision?"إشراف":autoAsara?"مكتمل":(isReservation||hasSeatReservation)?"صاحب حجز":isDirectProgram?"برنامج مباشر":"مسجل",intentId,now,now));
  statements.push(
    db.prepare("INSERT INTO orders(id,order_number,customer_id,order_type,program_id,program,track,delivery,language,purchase_source,payment_plan,base_total,discount_percent,total,paid,status,academy_status,finance_review_status,seat_reservation,competency_assessment,owner,cohort_label,scheduled_start_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'غير مسند',?,?,?,?)").bind(orderId,orderNumber,customerId,purchaseType,programId,program.name,track||"غير محدد",isAbat?"مسجل":delivery,orderLanguage,source,paymentPlan,baseTotal,discountPercent,contractTotal,amount,paymentPlan==="أقساط"?"مدفوع جزئياً":"مدفوع",autoAsara?"مكتمل":isScheduled?"غير مطبق":"تم التواصل",financeReviewStatus,hasSeatReservation?1:0,competencyAssessment?1:0,isScheduled?cohort:null,isScheduled?startDate:null,now,now),
    db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,proof_asset_key,flow_type,classification_status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)").bind(paymentId,orderId,amount,now,"مسجلة",method,reference,proofAssetKey,isSupervision?"collection":"sale",classificationStatus,now),
    db.prepare("INSERT INTO payment_intents(id,prospect_id,program_id,purchase_type,amount,method,reference,proof_asset_key,status,resulting_customer_id,resulting_order_id,created_by_email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(intentId,prospectId,programId,purchaseType,amount,method,reference,proofAssetKey,paymentIntentStatus,customerId,orderId,auth.email,now,now)
  );
  if(needsFinanceReview)statements.push(db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'payment',?,'المالية',?,'مفتوحة','عالية',?,?)").bind(id("TSK"),paymentId,isSupervision?"اعتماد طلب الإشراف للتحصيل":paymentPlan==="أقساط"?"اعتماد وتنظيم طلب أقساط":method==="Paytabs"?"مراجعة رابط مرجع Paytabs":"مراجعة واعتماد التحويل البنكي",auth.email,now));
  if(isScheduled)statements.push(db.prepare("INSERT INTO seat_reservations(id,customer_id,program_id,order_id,fee_amount,reservation_kind,status,cohort_label,start_date,assignment_date,confirmed_at,created_at,updated_at) VALUES(?,?,?,?,?,?,'بانتظار الإسناد',?,?,?,?,?,?)").bind(reservationId,customerId,programId,orderId,hasSeatReservation?seatFee:amount,isSupervision?"إشراف":(isReservation||hasSeatReservation)?"حجز مقعد":"برنامج مباشر",cohort||null,startDate,assignmentDate,now,now,now),db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,due_at,created_by_email,created_at) VALUES(?,'reservation',?,'المبيعات',?,'مفتوحة','عادية',?,?,?)").bind(id("TSK"),reservationId,isSupervision?"متابعة الإشراف حتى تاريخ الإسناد":(isReservation||hasSeatReservation)?"متابعة حجز المقعد حتى تاريخ الإسناد":"متابعة البرنامج المباشر حتى تاريخ الإسناد",assignmentDate,auth.email,now));
  else if(autoAsara)statements.push(db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,status,completed_at,created_at,updated_at) VALUES(?,?,?,?,'مكتمل',?,?,?)").bind(enrollmentId,customerId,programId,orderId,now,now,now));
  else statements.push(db.prepare("INSERT INTO enrollments(id,customer_id,program_id,order_id,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").bind(enrollmentId,customerId,programId,orderId,"تم التواصل",now,now),db.prepare("INSERT INTO workflow_tasks(id,entity_type,entity_id,department,title,status,priority,created_by_email,created_at) VALUES(?,'enrollment',?,'التشغيلية','تهيئة العميل واستكمال بياناته','مفتوحة','عالية',?,?)").bind(id("TSK"),enrollmentId,auth.email,now));
  statements.push(db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'RECORD_PAYMENT_AND_ADMIT','payment',?,?,?)").bind(id("AUD"),auth.email,paymentId,JSON.stringify({programId,purchaseType,source,baseTotal,discountPercent,discountedProgramTotal,seatFee,hasSeatReservation,competencyAssessment,contractTotal,amount,method,needsFinanceReview,customerId,orderId}),now));
  await db.batch(statements);
  return Response.json({ok:true,prospectId,paymentIntentId:intentId,customerId,orderId,reservationId,enrollmentId,status:"تم إنشاء العميل"},{status:201});
}
