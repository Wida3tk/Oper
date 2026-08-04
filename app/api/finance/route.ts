import { authorize, can, ensureFinanceClassificationSchema, id, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";
const cents=(value:unknown)=>Math.round(Number(value||0)*100);
const money=(value:number)=>value/100;
async function ensureFinanceUndoSchema(db:ReturnType<typeof operationalDb>){
 await db.prepare("CREATE TABLE IF NOT EXISTS finance_undo_log(id TEXT PRIMARY KEY,target_audit_id TEXT NOT NULL UNIQUE,order_id TEXT NOT NULL,undone_by_email TEXT NOT NULL,undone_at TEXT NOT NULL)").run();
}
function paymentBehavior(installments:Record<string,unknown>[],today:string){
 const paid=installments.filter(x=>x.status==="مدفوع"),overdue=installments.filter(x=>x.status!=="مدفوع"&&String(x.due_date)<today);
 const summary=`${paid.length} قسط مسدد · ${overdue.length} متأخر · ${installments.reduce((sum,x)=>sum+Number(x.reminder_count||0),0)} تذكير مسجل`;
 if(!installments.length)return {label:"جديد",tone:"neutral",summary};
 const behaviorOf=(x:Record<string,unknown>)=>{const reminders=Number(x.reminder_count||0);if(String(x.status)==="تطبيق السياسة")return "تطبيق السياسة";if(reminders>=4)return "تذكير نهائي";if(reminders===3)return "تذكير ثالث";if(reminders===2)return "تذكير ثاني";if(reminders===1)return "تذكير أول";if(String(x.status)==="موافقة تمديد")return "موافقة تمديد";if(String(x.status)==="متأخر"||String(x.due_date)<today&&String(x.status)!=="مدفوع")return "متأخر";return "ملتزم"};
 const counts=new Map<string,number>();for(const installment of installments){const label=behaviorOf(installment);counts.set(label,(counts.get(label)||0)+1)}
 const priority=["تطبيق السياسة","تذكير نهائي","تذكير ثالث","تذكير ثاني","تذكير أول","متأخر","موافقة تمديد","ملتزم"],label=[...counts].sort((a,b)=>b[1]-a[1]||priority.indexOf(a[0])-priority.indexOf(b[0]))[0]?.[0]||"ملتزم";
 const tone=label==="ملتزم"?"green":label==="تطبيق السياسة"||label==="متأخر"||label==="تذكير نهائي"?"red":label==="تذكير ثالث"||label==="تذكير ثاني"?"purple":"amber";return {label,tone,summary};
}

export async function GET(req:Request){
 const auth=await authorize(req,["finance","viewer"]);if(!auth.ok)return auth.response;
 if(!can(auth,"finance.view"))return Response.json({error:"لا تملكين صلاحية عرض المالية"},{status:403});
 const db=operationalDb();
 await ensureFinanceClassificationSchema(db);
 await ensureFinanceUndoSchema(db);
 const [ordersResult,paymentsResult,installmentsResult,notesResult,undoResult]=await Promise.all([
  db.prepare("SELECT o.id order_id,o.program_id,o.order_type,o.track program_track,o.delivery program_delivery,o.language program_language,o.competency_assessment,o.purchase_source,o.payment_plan,o.total stored_total,o.discount_percent,o.status order_status,o.finance_review_status,c.id customer_id,c.name customer_name,c.phone,c.email,p.name program_name,CASE WHEN o.seat_reservation=1 THEN COALESCE((SELECT MAX(r.fee_amount) FROM seat_reservations r WHERE r.order_id=o.id AND r.reservation_kind IN ('حجز مقعد','إشراف')),0) ELSE 0 END seat_fee FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN programs p ON p.id=o.program_id WHERE c.deleted_at IS NULL ORDER BY CASE o.finance_review_status WHEN 'pending' THEN 0 ELSE 1 END,o.updated_at DESC LIMIT 200").all<Record<string,unknown>>(),
  db.prepare("SELECT pay.id,pay.order_id,pay.amount,pay.due_date,pay.paid_at,pay.status,pay.method,pay.reference,pay.proof_asset_key,pay.flow_type,pay.classification_status,pay.created_at,(SELECT pi.id FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) payment_intent_id,(SELECT pi.status FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) reconciliation_status FROM payments pay ORDER BY COALESCE(pay.paid_at,pay.created_at) DESC").all<Record<string,unknown>>(),
  db.prepare("SELECT id,order_id,sequence,amount_cents,due_date,status,paid_payment_id,paid_at,reference,reminder_count,first_reminder_at,second_reminder_at,last_reminded_by_email FROM installments ORDER BY order_id,sequence").all<Record<string,unknown>>(),
  db.prepare("SELECT order_id,note,updated_by_email,updated_at FROM finance_notes").all<Record<string,unknown>>(),
  db.prepare("SELECT a.id,a.action,a.entity_type,a.entity_id,a.details,a.created_at FROM audit_log a LEFT JOIN finance_undo_log u ON u.target_audit_id=a.id WHERE u.target_audit_id IS NULL AND a.action IN ('UPDATE_FIRST_PAYMENT','SET_LEGACY_SEAT_FEE','PAY_INSTALLMENT','UPDATE_INSTALLMENT_DUE_DATE','UPDATE_PAYMENT_DATE','UPDATE_INSTALLMENT_STATUS') ORDER BY a.created_at DESC").all<Record<string,unknown>>()
 ]);
 const today=new Date().toISOString().slice(0,10);
 const orders=ordersResult.results.map(order=>{
  const orderPayments=paymentsResult.results.filter(x=>x.order_id===order.order_id);
  const paidCents=orderPayments.reduce((sum,x)=>sum+cents(x.amount),0),totalCents=cents(order.stored_total),remainingCents=Math.max(totalCents-paidCents,0);
  const orderInstallments=installmentsResult.results.filter(x=>x.order_id===order.order_id).map(x=>({...x,status:x.status==="قادم"?"ملتزم":x.status,amount:money(Number(x.amount_cents)),display_status:x.status!=="مدفوع"&&String(x.due_date)<today?"متأخر":x.status==="قادم"?"ملتزم":x.status}));
  const note=notesResult.results.find(x=>x.order_id===order.order_id);
  const undo=undoResult.results.map(row=>{try{return {...row,parsed:JSON.parse(String(row.details||"{}"))}}catch{return {...row,parsed:{}}}}).find(row=>row.entity_type==="order"?row.entity_id===order.order_id:row.parsed?.orderId===order.order_id);
  const undoLabels:Record<string,string>={UPDATE_FIRST_PAYMENT:"تعديل الدفعة الأولى",SET_LEGACY_SEAT_FEE:"تعديل رسوم المقعد",PAY_INSTALLMENT:"تسجيل سداد القسط",UPDATE_INSTALLMENT_DUE_DATE:"تعديل تاريخ الاستحقاق",UPDATE_PAYMENT_DATE:"تعديل تاريخ السداد الفعلي",UPDATE_INSTALLMENT_STATUS:"تعديل حالة السداد"};
  return {...order,total:money(totalCents),paid:money(paidCents),remaining:money(remainingCents),overpayment:money(Math.max(paidCents-totalCents,0)),payments:orderPayments,installments:orderInstallments,payment_behavior:paymentBehavior(orderInstallments,today),finance_note:note?.note||"",undo_available:undo?{id:undo.id,action:undo.action,label:undoLabels[String(undo.action)]||"آخر تحديث مالي",created_at:undo.created_at}:null};
 });
 const totalCents=orders.reduce((s,o)=>s+cents(o.total),0),paidCents=orders.reduce((s,o)=>s+cents(o.paid),0),remainingCents=orders.reduce((s,o)=>s+cents(o.remaining),0);
 return Response.json({orders,summary:{total:money(totalCents),paid:money(paidCents),remaining:money(remainingCents),overdue:orders.reduce((s,o)=>s+o.installments.filter(x=>x.display_status==="متأخر").length,0)}});
}

function dueDate(start:string,offset:number){
 const [year,month,day]=start.split("-").map(Number),targetMonth=month-1+offset,targetYear=year+Math.floor(targetMonth/12),normalizedMonth=((targetMonth%12)+12)%12,lastDay=new Date(Date.UTC(targetYear,normalizedMonth+1,0)).getUTCDate();
 return `${targetYear}-${String(normalizedMonth+1).padStart(2,"0")}-${String(Math.min(day,lastDay)).padStart(2,"0")}`;
}

export async function POST(req:Request){
 const auth=await authorize(req,["finance"]);if(!auth.ok)return auth.response;
 const body=await req.json() as Record<string,unknown>,action=String(body.action||""),orderId=String(body.orderId||"");
 if(!orderId)return Response.json({error:"رقم الطلب مطلوب"},{status:400});
 const db=operationalDb(),now=new Date().toISOString(),order=await db.prepare("SELECT id,total,order_type FROM orders WHERE id=?").bind(orderId).first<{id:string,total:number;order_type:string}>();
 await ensureFinanceUndoSchema(db);
 if(!order)return Response.json({error:"الطلب غير موجود"},{status:404});
 const paidRow=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=?").bind(orderId).first<{paid:number}>(),paidCents=cents(paidRow?.paid);
 if(action==="undo_last_finance_action"){
  if(!can(auth,"finance.payments.record")||!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية التراجع عن الإجراءات المالية"},{status:403});
  const target=await db.prepare("SELECT a.id,a.action,a.entity_type,a.entity_id,a.details FROM audit_log a LEFT JOIN finance_undo_log u ON u.target_audit_id=a.id WHERE u.target_audit_id IS NULL AND a.action IN ('UPDATE_FIRST_PAYMENT','SET_LEGACY_SEAT_FEE','PAY_INSTALLMENT','UPDATE_INSTALLMENT_DUE_DATE','UPDATE_PAYMENT_DATE','UPDATE_INSTALLMENT_STATUS') AND ((a.entity_type='order' AND a.entity_id=?) OR json_extract(a.details,'$.orderId')=?) ORDER BY a.created_at DESC LIMIT 1").bind(orderId,orderId).first<{id:string;action:string;entity_type:string;entity_id:string;details:string}>();
  if(!target)return Response.json({error:"لا يوجد إجراء مالي متاح للتراجع لهذا العميل"},{status:409});
  let details:Record<string,unknown>={};try{details=JSON.parse(target.details||"{}")}catch{}
  const statements=[];
  if(target.action==="UPDATE_INSTALLMENT_DUE_DATE"){
   statements.push(db.prepare("UPDATE installments SET due_date=?,updated_at=? WHERE id=? AND order_id=?").bind(String(details.previousDueDate||""),now,target.entity_id,orderId));
  }else if(target.action==="UPDATE_PAYMENT_DATE"){
   const paymentId=String(details.paymentId||"");if(!paymentId)return Response.json({error:"بيانات التراجع عن تاريخ السداد غير مكتملة"},{status:409});
   statements.push(db.prepare("UPDATE payments SET paid_at=? WHERE id=? AND order_id=?").bind(details.previousPaymentPaidAt||null,paymentId,orderId),db.prepare("UPDATE installments SET paid_at=?,updated_at=? WHERE id=? AND order_id=?").bind(details.previousInstallmentPaidAt||null,now,target.entity_id,orderId));
  }else if(target.action==="UPDATE_INSTALLMENT_STATUS"){
   statements.push(db.prepare("UPDATE installments SET status=?,reminder_count=?,first_reminder_at=?,second_reminder_at=?,last_reminded_by_email=?,updated_at=? WHERE id=? AND order_id=?").bind(String(details.previousStatus||"ملتزم"),Number(details.previousReminderCount||0),details.previousFirstReminderAt||null,details.previousSecondReminderAt||null,details.previousLastRemindedByEmail||null,now,target.entity_id,orderId));
  }else if(target.action==="UPDATE_FIRST_PAYMENT"){
   const paymentId=String(details.paymentId||"");const previousAmount=Number(details.previousAmount||0);
   if(!paymentId)return Response.json({error:"بيانات التراجع عن الدفعة الأولى غير مكتملة"},{status:409});
   const other=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=? AND id!=?").bind(orderId,paymentId).first<{paid:number}>(),restoredPaid=cents(other?.paid)+cents(previousAmount);
   statements.push(db.prepare("UPDATE payments SET amount=? WHERE id=? AND order_id=?").bind(previousAmount,paymentId,orderId),db.prepare("UPDATE payment_intents SET amount=?,updated_at=? WHERE resulting_order_id=? AND id=(SELECT id FROM payment_intents WHERE resulting_order_id=? ORDER BY created_at LIMIT 1)").bind(previousAmount,now,orderId,orderId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(restoredPaid),restoredPaid===cents(order.total)?"مدفوع":restoredPaid>0?"مدفوع جزئياً":"غير مدفوع",now,orderId));
  }else if(target.action==="PAY_INSTALLMENT"){
   const paymentId=String(details.paymentId||"");if(!paymentId)return Response.json({error:"بيانات التراجع عن السداد غير مكتملة"},{status:409});
   const payment=await db.prepare("SELECT amount FROM payments WHERE id=? AND order_id=?").bind(paymentId,orderId).first<{amount:number}>();if(!payment)return Response.json({error:"دفعة السداد لم تعد موجودة"},{status:409});
   const restoredPaid=paidCents-cents(payment.amount);if(restoredPaid<0)return Response.json({error:"تعذر موازنة الرصيد عند التراجع"},{status:409});
   statements.push(db.prepare("UPDATE installments SET status=?,paid_payment_id=?,paid_at=?,reference=?,updated_at=? WHERE id=? AND order_id=?").bind(String(details.previousStatus||"ملتزم"),details.previousPaidPaymentId||null,details.previousPaidAt||null,details.previousReference||null,now,target.entity_id,orderId),db.prepare("DELETE FROM payments WHERE id=? AND order_id=?").bind(paymentId,orderId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(restoredPaid),restoredPaid===cents(order.total)?"مدفوع":restoredPaid>0?"مدفوع جزئياً":"غير مدفوع",now,orderId));
  }else if(target.action==="SET_LEGACY_SEAT_FEE"){
   const previousFeeCents=cents(details.previousSeatFee),currentFeeCents=cents(details.seatFee),deltaCents=previousFeeCents-currentFeeCents;
   const first=await db.prepare("SELECT id,amount FROM payments WHERE order_id=? ORDER BY CASE WHEN flow_type='sale' THEN 0 ELSE 1 END,COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string;amount:number}>();if(!first)return Response.json({error:"لا توجد دفعة يمكن إعادة موازنتها"},{status:409});
   const newTotal=cents(order.total)-deltaCents,newFirst=cents(first.amount)-deltaCents,newPaid=paidCents-deltaCents;if(newTotal<1||newFirst<0||newPaid<0)return Response.json({error:"تعذر موازنة رسوم المقعد عند التراجع"},{status:409});
   statements.push(db.prepare("UPDATE payments SET amount=? WHERE id=?").bind(money(newFirst),first.id),db.prepare("UPDATE orders SET total=?,paid=?,seat_reservation=?,status=?,updated_at=? WHERE id=?").bind(money(newTotal),money(newPaid),previousFeeCents>0?1:0,newPaid===newTotal?"مدفوع":newPaid>0?"مدفوع جزئياً":"غير مدفوع",now,orderId),db.prepare("UPDATE payment_intents SET amount=MAX(amount-?,0),updated_at=? WHERE id=(SELECT id FROM payment_intents WHERE resulting_order_id=? ORDER BY created_at LIMIT 1)").bind(money(deltaCents),now,orderId),db.prepare("UPDATE seat_reservations SET fee_amount=?,updated_at=? WHERE order_id=? AND reservation_kind IN ('حجز مقعد','إشراف')").bind(money(previousFeeCents),now,orderId));
  }
  statements.push(db.prepare("INSERT INTO finance_undo_log(id,target_audit_id,order_id,undone_by_email,undone_at) VALUES(?,?,?,?,?)").bind(id("UND"),target.id,orderId,auth.email,now),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UNDO_FINANCE_ACTION','order',?,?,?)").bind(id("AUD"),auth.email,orderId,JSON.stringify({targetAuditId:target.id,targetAction:target.action}),now));
  await db.batch(statements);return Response.json({ok:true,undone:target.action});
 }
 if(["review_legacy_installments","approve_finance_review"].includes(action)){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية مراجعة الأقساط"},{status:403});
  const review=await db.prepare("SELECT finance_review_status FROM orders WHERE id=?").bind(orderId).first<{finance_review_status:string}>();
  if(review?.finance_review_status!=="pending")return Response.json({error:"الطلب لا ينتظر مراجعة المالية"},{status:409});
  const first=await db.prepare("SELECT id FROM payments WHERE order_id=? ORDER BY COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string}>();
  await db.batch([
   db.prepare("UPDATE payments SET flow_type=CASE WHEN ?='إشراف' THEN 'collection' WHEN id=? THEN 'sale' ELSE 'collection' END,classification_status='confirmed' WHERE order_id=?").bind(order.order_type,first?.id||"",orderId),
   db.prepare("UPDATE orders SET finance_review_status='approved',updated_at=? WHERE id=?").bind(now,orderId),
   db.prepare("UPDATE payment_intents SET status='معتمدة',reviewed_by_finance_email=?,reviewed_at=?,updated_at=? WHERE resulting_order_id=?").bind(auth.email,now,now,orderId),
   db.prepare("UPDATE workflow_tasks SET status='مكتملة',completed_at=? WHERE entity_type='payment' AND entity_id IN (SELECT id FROM payments WHERE order_id=?) AND status!='مكتملة'").bind(now,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'APPROVE_LEGACY_INSTALLMENTS','order',?,'{}',?)").bind(id("AUD"),auth.email,orderId,now)
  ]);
  return Response.json({ok:true});
 }
 if(action==="schedule"){
  if(!can(auth,"finance.total.edit")||!can(auth,"finance.installments.manage"))return Response.json({error:"لا تملكين صلاحية تعديل الإجمالي والأقساط"},{status:403});
  const totalCents=cents(body.total),count=Math.floor(Number(body.count||0)),start=String(body.start||"");
  const regularAmountCents=cents(body.regularAmount),finalAmountCents=cents(body.finalAmount);
  if(totalCents<paidCents)return Response.json({error:"إجمالي العقد لا يمكن أن يكون أقل من الدفعات المسجلة"},{status:400});
  if(count<1||count>36||!/^\d{4}-\d{2}-\d{2}$/.test(start))return Response.json({error:"عدد الأقساط وتاريخ البداية مطلوبان"},{status:400});
  const remaining=totalCents-paidCents;if(remaining<1)return Response.json({error:"إجمالي العقد الحالي يساوي المبلغ المدفوع. عدّلي إجمالي العقد إلى قيمته الكاملة أولاً، ثم أنشئي جدول الأقساط"},{status:400});
  if(finalAmountCents<1||(count>1&&regularAmountCents<1))return Response.json({error:"مبلغ القسط الشهري ومبلغ الدفعة الأخيرة مطلوبان"},{status:400});
  const scheduledTotal=(count>1?(count-1)*regularAmountCents:0)+finalAmountCents;
  if(scheduledTotal!==remaining)return Response.json({error:`مجموع جدول الأقساط يجب أن يساوي المتبقي على العميل (${money(remaining).toFixed(2)} ر.س)`},{status:400});
  const paidSeq=await db.prepare("SELECT COALESCE(MAX(sequence),0) seq FROM installments WHERE order_id=? AND status='مدفوع'").bind(orderId).first<{seq:number}>();
  const statements=[db.prepare("UPDATE orders SET total=?,paid=?,payment_plan='أقساط',status=?,updated_at=? WHERE id=?").bind(money(totalCents),money(paidCents),remaining===0?"مدفوع":"مدفوع جزئياً",now,orderId),db.prepare("DELETE FROM installments WHERE order_id=? AND status!='مدفوع'").bind(orderId)];
  for(let i=0;i<count;i++)statements.push(db.prepare("INSERT INTO installments(id,order_id,sequence,amount_cents,due_date,status,created_at,updated_at) VALUES(?,?,?,?,?,'قادم',?,?)").bind(id("INS"),orderId,Number(paidSeq?.seq||0)+i+1,i===count-1?finalAmountCents:regularAmountCents,dueDate(start,i),now,now));
  await db.batch(statements);return Response.json({ok:true});
 }
 if(action==="update_first_payment"){
  if(!can(auth,"finance.payments.record"))return Response.json({error:"لا تملكين صلاحية تعديل الدفعة الأولى"},{status:403});
  const amountCents=cents(body.amount);if(amountCents<0||amountCents>cents(order.total))return Response.json({error:"قيمة الدفعة الأولى يجب أن تكون بين صفر وإجمالي عقد البرنامج"},{status:400});
  const existingInstallments=await db.prepare("SELECT COUNT(*) count FROM installments WHERE order_id=?").bind(orderId).first<{count:number}>();
  if(Number(existingInstallments?.count||0)>0)return Response.json({error:"أعيدي جدولة الأقساط بعد حذف الجدول الحالي قبل تعديل الدفعة الأولى"},{status:409});
  const first=await db.prepare("SELECT id,amount FROM payments WHERE order_id=? ORDER BY CASE WHEN flow_type='sale' THEN 0 ELSE 1 END,COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string;amount:number}>();
  if(!first)return Response.json({error:"لا توجد دفعة أولى مسجلة لهذا الطلب"},{status:404});
  const otherPaid=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=? AND id!=?").bind(orderId,first.id).first<{paid:number}>(),newPaidCents=cents(otherPaid?.paid)+amountCents;
  if(newPaidCents>cents(order.total))return Response.json({error:"إجمالي الدفعات يتجاوز عقد البرنامج"},{status:400});
  await db.batch([db.prepare("UPDATE payments SET amount=? WHERE id=?").bind(money(amountCents),first.id),db.prepare("UPDATE payment_intents SET amount=?,updated_at=? WHERE resulting_order_id=? AND id=(SELECT payment_intent_id FROM (SELECT pi.id payment_intent_id FROM payment_intents pi WHERE pi.resulting_order_id=? ORDER BY pi.created_at LIMIT 1))").bind(money(amountCents),now,orderId,orderId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(newPaidCents),newPaidCents===cents(order.total)?"مدفوع":newPaidCents>0?"مدفوع جزئياً":"غير مدفوع",now,orderId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_FIRST_PAYMENT','order',?,?,?)").bind(id("AUD"),auth.email,orderId,JSON.stringify({paymentId:first.id,previousAmount:Number(first.amount||0),amount:money(amountCents),orderId}),now)]);
  return Response.json({ok:true,paid:money(newPaidCents),remaining:money(cents(order.total)-newPaidCents)});
 }
 if(["separate_legacy_seat_fee","set_legacy_seat_fee"].includes(action)){
  if(!can(auth,"finance.total.edit")||!can(auth,"finance.payments.record"))return Response.json({error:"ليس لديك صلاحية فصل رسوم المقعد"},{status:403});
  const feeCents=cents(body.seatFee);
  if(feeCents<1)return Response.json({error:"قيمة رسوم المقعد مطلوبة"},{status:400});
  const details=await db.prepare("SELECT o.id,o.customer_id,o.program_id,o.total,o.seat_reservation,(SELECT COALESCE(MAX(r.fee_amount),0) FROM seat_reservations r WHERE r.order_id=o.id AND r.reservation_kind IN ('حجز مقعد','إشراف')) seat_fee FROM orders o WHERE o.id=?").bind(orderId).first<{id:string;customer_id:string;program_id:string;total:number;seat_reservation:number;seat_fee:number}>();
  if(!details)return Response.json({error:"الطلب غير موجود"},{status:404});
  const first=await db.prepare("SELECT id,amount FROM payments WHERE order_id=? ORDER BY CASE WHEN flow_type='sale' THEN 0 ELSE 1 END,COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string;amount:number}>();
  if(!first)return Response.json({error:"لا توجد دفعة يمكن فصل رسوم المقعد منها"},{status:409});
  const previousFeeCents=cents(details.seat_fee),deltaCents=feeCents-previousFeeCents,totalCents=cents(details.total),firstCents=cents(first.amount);
  const existingReservation=await db.prepare("SELECT id FROM seat_reservations WHERE order_id=? AND reservation_kind IN ('حجز مقعد','إشراف') ORDER BY created_at LIMIT 1").bind(orderId).first<{id:string}>();
  const newTotalCents=totalCents-deltaCents,newFirstCents=firstCents-deltaCents,newPaidCents=paidCents-deltaCents;
  if(newFirstCents<0)return Response.json({error:"الفرق في رسوم المقعد لا يمكن أن يتجاوز أول دفعة مسجلة"},{status:400});
  if(newPaidCents<0||newTotalCents<1||newTotalCents<newPaidCents)return Response.json({error:"تعذر تعديل الرسوم لأن البيانات المالية الحالية غير متوازنة"},{status:409});
  const statements=[
   db.prepare("UPDATE payments SET amount=? WHERE id=?").bind(money(newFirstCents),first.id),
   db.prepare("UPDATE orders SET total=?,paid=?,seat_reservation=1,status=?,updated_at=? WHERE id=?").bind(money(newTotalCents),money(newPaidCents),newPaidCents===newTotalCents?"مدفوع":newPaidCents>0?"مدفوع جزئياً":"غير مدفوع",now,orderId),
   db.prepare("UPDATE payment_intents SET amount=MAX(amount-?,0),updated_at=? WHERE id=(SELECT id FROM payment_intents WHERE resulting_order_id=? ORDER BY created_at LIMIT 1)").bind(money(deltaCents),now,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'SET_LEGACY_SEAT_FEE','order',?,?,?)").bind(id("AUD"),auth.email,orderId,JSON.stringify({previousSeatFee:money(previousFeeCents),seatFee:money(feeCents),difference:money(deltaCents),previousTotal:money(totalCents),newProgramTotal:money(newTotalCents),previousFirstPayment:money(firstCents),newFirstPayment:money(newFirstCents)}),now)
  ];
  if(existingReservation)statements.splice(3,0,db.prepare("UPDATE seat_reservations SET fee_amount=?,status='تم التحويل',confirmed_at=COALESCE(confirmed_at,?),updated_at=? WHERE id=?").bind(money(feeCents),now,now,existingReservation.id));
  else statements.splice(3,0,db.prepare("INSERT INTO seat_reservations(id,customer_id,program_id,order_id,fee_amount,status,reservation_kind,confirmed_at,created_at,updated_at) VALUES(?,?,?,?,?,'تم التحويل','حجز مقعد',?,?,?)").bind(id("RSV"),details.customer_id,details.program_id,orderId,money(feeCents),now,now,now));
  await db.batch(statements);
  return Response.json({ok:true,seatFee:money(feeCents),total:money(newTotalCents),paid:money(newPaidCents),remaining:money(newTotalCents-newPaidCents)});
 }
 if(action==="pay_installment"){
  if(!can(auth,"finance.payments.record"))return Response.json({error:"لا تملكين صلاحية تسجيل الدفعات والمراجع"},{status:403});
  const installmentId=String(body.installmentId||""),method=String(body.method||"").trim(),reference=String(body.reference||"").trim();
  const installment=await db.prepare("SELECT id,amount_cents,status,paid_payment_id,paid_at,reference FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string,amount_cents:number,status:string;paid_payment_id:string|null;paid_at:string|null;reference:string|null}>();
  if(!installment||installment.status==="مدفوع")return Response.json({error:"القسط غير متاح للسداد"},{status:409});
  if(!method||!reference)return Response.json({error:"وسيلة الدفع والرقم المرجعي مطلوبان"},{status:400});
  const totalCents=cents(order.total);if(paidCents+installment.amount_cents>totalCents)return Response.json({error:"هذه الدفعة تتجاوز المتبقي على العميل"},{status:400});
  const paymentId=id("PAY"),newPaid=paidCents+installment.amount_cents;
  const paymentStatements=[db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,flow_type,classification_status,created_at) VALUES(?,?,?,?,?,?,?,'collection','confirmed',?)").bind(paymentId,orderId,money(installment.amount_cents),now,"مسجلة",method,reference,now),db.prepare("UPDATE installments SET status='مدفوع',paid_payment_id=?,paid_at=?,reference=?,updated_at=? WHERE id=?").bind(paymentId,now,reference,now,installmentId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(newPaid),newPaid===totalCents?"مدفوع":"مدفوع جزئياً",now,orderId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'PAY_INSTALLMENT','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,paymentId,amount:money(installment.amount_cents),reference,previousStatus:installment.status,previousPaidPaymentId:installment.paid_payment_id,previousPaidAt:installment.paid_at,previousReference:installment.reference}),now)];
  const attention=await db.prepare("SELECT state FROM attention_followups WHERE order_id=?").bind(orderId).first<{state:string}>();
  if(installment.status==="تطبيق السياسة"||attention?.state==="waiting_finance")paymentStatements.push(db.prepare("INSERT INTO attention_followups(order_id,state,finance_action_by_email,finance_action_at,updated_at) VALUES(?,'finance_resolved',?,?,?) ON CONFLICT(order_id) DO UPDATE SET state='finance_resolved',finance_action_by_email=excluded.finance_action_by_email,finance_action_at=excluded.finance_action_at,updated_at=excluded.updated_at").bind(orderId,auth.email,now,now));
  await db.batch(paymentStatements);
  return Response.json({ok:true});
 }
 if(action==="remind_installment"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية متابعة الأقساط"},{status:403});
  const installmentId=String(body.installmentId||"");
  const installment=await db.prepare("SELECT id,status,reminder_count FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string;status:string;reminder_count:number}>();
  if(!installment||installment.status==="مدفوع")return Response.json({error:"القسط غير متاح للتذكير"},{status:409});
  const nextCount=Math.min(Number(installment.reminder_count||0)+1,2);
  if(Number(installment.reminder_count||0)>=2)return Response.json({error:"تم تسجيل التذكيرين لهذا القسط مسبقاً"},{status:409});
  await db.batch([
   db.prepare("UPDATE installments SET reminder_count=?,first_reminder_at=CASE WHEN ?=1 THEN ? ELSE first_reminder_at END,second_reminder_at=CASE WHEN ?=2 THEN ? ELSE second_reminder_at END,last_reminded_by_email=?,status=?,updated_at=? WHERE id=? AND order_id=?").bind(nextCount,nextCount,now,nextCount,now,auth.email,nextCount===1?"تذكير أول":"تذكير ثانٍ",now,installmentId,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'RECORD_INSTALLMENT_REMINDER','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,reminderNumber:nextCount}),now)
  ]);
  return Response.json({ok:true,reminderCount:nextCount});
 }
 if(action==="update_installment_due_date"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية تعديل تاريخ الاستحقاق"},{status:403});
  const installmentId=String(body.installmentId||""),dueDateValue=String(body.dueDate||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dueDateValue))return Response.json({error:"تاريخ الاستحقاق غير صالح"},{status:400});
  const installment=await db.prepare("SELECT id,due_date FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string;due_date:string}>();
  if(!installment)return Response.json({error:"القسط غير موجود"},{status:404});
  if(installment.due_date===dueDateValue)return Response.json({ok:true,unchanged:true});
  await db.batch([
   db.prepare("UPDATE installments SET due_date=?,updated_at=? WHERE id=? AND order_id=?").bind(dueDateValue,now,installmentId,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_INSTALLMENT_DUE_DATE','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,previousDueDate:installment.due_date,dueDate:dueDateValue}),now)
  ]);
  return Response.json({ok:true,dueDate:dueDateValue});
 }
 if(action==="update_payment_date"){
  if(!can(auth,"finance.payments.record"))return Response.json({error:"ليس لديك صلاحية تعديل تاريخ السداد الفعلي"},{status:403});
  const installmentId=String(body.installmentId||""),paymentDate=String(body.paymentDate||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(paymentDate))return Response.json({error:"تاريخ السداد الفعلي غير صالح"},{status:400});
  const installment=await db.prepare("SELECT id,paid_payment_id,paid_at,status FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string;paid_payment_id:string|null;paid_at:string|null;status:string}>();
  if(!installment||installment.status!=="مدفوع"||!installment.paid_payment_id)return Response.json({error:"لا توجد دفعة مسجلة لهذا القسط"},{status:409});
  const payment=await db.prepare("SELECT paid_at FROM payments WHERE id=? AND order_id=?").bind(installment.paid_payment_id,orderId).first<{paid_at:string|null}>();
  if(!payment)return Response.json({error:"سجل الدفعة غير موجود"},{status:404});
  const paidAt=`${paymentDate}T12:00:00.000Z`;
  if(String(payment.paid_at||"").slice(0,10)===paymentDate&&String(installment.paid_at||"").slice(0,10)===paymentDate)return Response.json({ok:true,unchanged:true});
  await db.batch([
   db.prepare("UPDATE payments SET paid_at=? WHERE id=? AND order_id=?").bind(paidAt,installment.paid_payment_id,orderId),
   db.prepare("UPDATE installments SET paid_at=?,updated_at=? WHERE id=? AND order_id=?").bind(paidAt,now,installmentId,orderId),
   db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_PAYMENT_DATE','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,paymentId:installment.paid_payment_id,previousPaymentPaidAt:payment.paid_at,previousInstallmentPaidAt:installment.paid_at,paymentDate:paidAt}),now)
  ]);
  return Response.json({ok:true,paymentDate:paidAt});
 }
 if(action==="installment_status"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"لا تملكين صلاحية متابعة الأقساط"},{status:403});
  const installmentId=String(body.installmentId||""),status=String(body.status||"");
  if(!["ملتزم","تذكير أول","تذكير ثاني","تذكير ثالث","تذكير نهائي","موافقة تمديد","تطبيق السياسة","متأخر"].includes(status))return Response.json({error:"حالة السداد غير صالحة"},{status:400});
  const installment=await db.prepare("SELECT status,reminder_count,first_reminder_at,second_reminder_at,last_reminded_by_email FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{status:string;reminder_count:number;first_reminder_at:string|null;second_reminder_at:string|null;last_reminded_by_email:string|null}>();
  if(!installment)return Response.json({error:"القسط غير موجود"},{status:404});
  const reminderCount=status==="تذكير أول"?1:status==="تذكير ثاني"?2:status==="تذكير ثالث"?3:status==="تذكير نهائي"?4:null;
  if(reminderCount)await db.prepare("UPDATE installments SET status=?,reminder_count=MAX(COALESCE(reminder_count,0),?),first_reminder_at=CASE WHEN first_reminder_at IS NULL THEN ? ELSE first_reminder_at END,second_reminder_at=CASE WHEN ?>=2 AND second_reminder_at IS NULL THEN ? ELSE second_reminder_at END,last_reminded_by_email=?,updated_at=? WHERE id=? AND order_id=? AND status!='مدفوع'").bind(status,reminderCount,now,reminderCount,now,auth.email,now,installmentId,orderId).run();
  else await db.prepare("UPDATE installments SET status=?,updated_at=? WHERE id=? AND order_id=? AND status!='مدفوع'").bind(status,now,installmentId,orderId).run();
  const followup=await db.prepare("SELECT state FROM attention_followups WHERE order_id=?").bind(orderId).first<{state:string}>();
  if(status==="تطبيق السياسة"&&installment.status!=="تطبيق السياسة"){
   await db.prepare("INSERT INTO attention_followups(order_id,state,updated_at) VALUES(?,'needs_operations',?) ON CONFLICT(order_id) DO UPDATE SET state='needs_operations',first_action_by_email=NULL,first_action_at=NULL,finance_action_by_email=NULL,finance_action_at=NULL,final_action_by_email=NULL,final_action_at=NULL,updated_at=excluded.updated_at").bind(orderId,now).run();
  }else if(status!=="تطبيق السياسة"&&(installment.status==="تطبيق السياسة"||followup?.state==="waiting_finance")){
   await db.prepare("INSERT INTO attention_followups(order_id,state,finance_action_by_email,finance_action_at,updated_at) VALUES(?,'finance_resolved',?,?,?) ON CONFLICT(order_id) DO UPDATE SET state='finance_resolved',finance_action_by_email=excluded.finance_action_by_email,finance_action_at=excluded.finance_action_at,updated_at=excluded.updated_at").bind(orderId,auth.email,now,now).run();
  }
  await db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_INSTALLMENT_STATUS','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,previousStatus:installment.status,status,previousReminderCount:Number(installment.reminder_count||0),previousFirstReminderAt:installment.first_reminder_at,previousSecondReminderAt:installment.second_reminder_at,previousLastRemindedByEmail:installment.last_reminded_by_email}),now).run();
  return Response.json({ok:true});
 }
 if(action==="note"){
  const note=String(body.note||"").trim();await db.prepare("INSERT INTO finance_notes(order_id,note,updated_by_email,updated_at) VALUES(?,?,?,?) ON CONFLICT(order_id) DO UPDATE SET note=excluded.note,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(orderId,note,auth.email,now).run();return Response.json({ok:true});
 }
 return Response.json({error:"الإجراء المالي غير صالح"},{status:400});
}
