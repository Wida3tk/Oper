import { authorize, can, ensureFinanceClassificationSchema, id, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";
const cents=(value:unknown)=>Math.round(Number(value||0)*100);
const money=(value:number)=>value/100;
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
 const [ordersResult,paymentsResult,installmentsResult,notesResult]=await Promise.all([
  db.prepare("SELECT o.id order_id,o.order_type,o.purchase_source,o.payment_plan,o.total stored_total,o.status order_status,o.finance_review_status,c.id customer_id,c.name customer_name,c.phone,c.email,p.name program_name,CASE WHEN o.seat_reservation=1 THEN COALESCE((SELECT MAX(r.fee_amount) FROM seat_reservations r WHERE r.order_id=o.id AND r.reservation_kind='حجز مقعد'),0) ELSE 0 END seat_fee FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN programs p ON p.id=o.program_id ORDER BY CASE o.finance_review_status WHEN 'pending' THEN 0 ELSE 1 END,o.updated_at DESC LIMIT 200").all<Record<string,unknown>>(),
  db.prepare("SELECT pay.id,pay.order_id,pay.amount,pay.due_date,pay.paid_at,pay.status,pay.method,pay.reference,pay.proof_asset_key,pay.flow_type,pay.classification_status,pay.created_at,(SELECT pi.id FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) payment_intent_id,(SELECT pi.status FROM payment_intents pi WHERE pi.resulting_order_id=pay.order_id AND ABS(pi.amount-pay.amount)<0.001 ORDER BY pi.created_at LIMIT 1) reconciliation_status FROM payments pay ORDER BY COALESCE(pay.paid_at,pay.created_at) DESC").all<Record<string,unknown>>(),
  db.prepare("SELECT id,order_id,sequence,amount_cents,due_date,status,paid_payment_id,paid_at,reference,reminder_count,first_reminder_at,second_reminder_at,last_reminded_by_email FROM installments ORDER BY order_id,sequence").all<Record<string,unknown>>(),
  db.prepare("SELECT order_id,note,updated_by_email,updated_at FROM finance_notes").all<Record<string,unknown>>()
 ]);
 const today=new Date().toISOString().slice(0,10);
 const orders=ordersResult.results.map(order=>{
  const orderPayments=paymentsResult.results.filter(x=>x.order_id===order.order_id);
  const paidCents=orderPayments.reduce((sum,x)=>sum+cents(x.amount),0),totalCents=cents(order.stored_total),remainingCents=Math.max(totalCents-paidCents,0);
  const orderInstallments=installmentsResult.results.filter(x=>x.order_id===order.order_id).map(x=>({...x,status:x.status==="قادم"?"ملتزم":x.status,amount:money(Number(x.amount_cents)),display_status:x.status!=="مدفوع"&&String(x.due_date)<today?"متأخر":x.status==="قادم"?"ملتزم":x.status}));
  const note=notesResult.results.find(x=>x.order_id===order.order_id);
  return {...order,total:money(totalCents),paid:money(paidCents),remaining:money(remainingCents),overpayment:money(Math.max(paidCents-totalCents,0)),payments:orderPayments,installments:orderInstallments,payment_behavior:paymentBehavior(orderInstallments,today),finance_note:note?.note||""};
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
 const db=operationalDb(),now=new Date().toISOString(),order=await db.prepare("SELECT id,total FROM orders WHERE id=?").bind(orderId).first<{id:string,total:number}>();
 if(!order)return Response.json({error:"الطلب غير موجود"},{status:404});
 const paidRow=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=?").bind(orderId).first<{paid:number}>(),paidCents=cents(paidRow?.paid);
 if(["review_legacy_installments","approve_finance_review"].includes(action)){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"ليس لديك صلاحية مراجعة الأقساط"},{status:403});
  const review=await db.prepare("SELECT finance_review_status FROM orders WHERE id=?").bind(orderId).first<{finance_review_status:string}>();
  if(review?.finance_review_status!=="pending")return Response.json({error:"الطلب لا ينتظر مراجعة المالية"},{status:409});
  const first=await db.prepare("SELECT id FROM payments WHERE order_id=? ORDER BY COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string}>();
  await db.batch([
   db.prepare("UPDATE payments SET flow_type=CASE WHEN id=? THEN 'sale' WHEN id IN (SELECT paid_payment_id FROM installments WHERE order_id=? AND paid_payment_id IS NOT NULL) THEN 'collection' ELSE 'collection' END,classification_status='confirmed' WHERE order_id=?").bind(first?.id||"",orderId,orderId),
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
  const first=await db.prepare("SELECT id FROM payments WHERE order_id=? ORDER BY CASE WHEN flow_type='sale' THEN 0 ELSE 1 END,COALESCE(paid_at,created_at),created_at LIMIT 1").bind(orderId).first<{id:string}>();
  if(!first)return Response.json({error:"لا توجد دفعة أولى مسجلة لهذا الطلب"},{status:404});
  const otherPaid=await db.prepare("SELECT COALESCE(SUM(amount),0) paid FROM payments WHERE order_id=? AND id!=?").bind(orderId,first.id).first<{paid:number}>(),newPaidCents=cents(otherPaid?.paid)+amountCents;
  if(newPaidCents>cents(order.total))return Response.json({error:"إجمالي الدفعات يتجاوز عقد البرنامج"},{status:400});
  await db.batch([db.prepare("UPDATE payments SET amount=? WHERE id=?").bind(money(amountCents),first.id),db.prepare("UPDATE payment_intents SET amount=?,updated_at=? WHERE resulting_order_id=? AND id=(SELECT payment_intent_id FROM (SELECT pi.id payment_intent_id FROM payment_intents pi WHERE pi.resulting_order_id=? ORDER BY pi.created_at LIMIT 1))").bind(money(amountCents),now,orderId,orderId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(newPaidCents),newPaidCents===cents(order.total)?"مدفوع":newPaidCents>0?"مدفوع جزئياً":"غير مدفوع",now,orderId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_FIRST_PAYMENT','order',?,?,?)").bind(id("AUD"),auth.email,orderId,JSON.stringify({paymentId:first.id,amount:money(amountCents)}),now)]);
  return Response.json({ok:true,paid:money(newPaidCents),remaining:money(cents(order.total)-newPaidCents)});
 }
 if(action==="pay_installment"){
  if(!can(auth,"finance.payments.record"))return Response.json({error:"لا تملكين صلاحية تسجيل الدفعات والمراجع"},{status:403});
  const installmentId=String(body.installmentId||""),method=String(body.method||"").trim(),reference=String(body.reference||"").trim();
  const installment=await db.prepare("SELECT id,amount_cents,status FROM installments WHERE id=? AND order_id=?").bind(installmentId,orderId).first<{id:string,amount_cents:number,status:string}>();
  if(!installment||installment.status==="مدفوع")return Response.json({error:"القسط غير متاح للسداد"},{status:409});
  if(!method||!reference)return Response.json({error:"وسيلة الدفع والرقم المرجعي مطلوبان"},{status:400});
  const totalCents=cents(order.total);if(paidCents+installment.amount_cents>totalCents)return Response.json({error:"هذه الدفعة تتجاوز المتبقي على العميل"},{status:400});
  const paymentId=id("PAY"),newPaid=paidCents+installment.amount_cents;
  await db.batch([db.prepare("INSERT INTO payments(id,order_id,amount,paid_at,status,method,reference,flow_type,classification_status,created_at) VALUES(?,?,?,?,?,?,?,'collection','confirmed',?)").bind(paymentId,orderId,money(installment.amount_cents),now,"مسجلة",method,reference,now),db.prepare("UPDATE installments SET status='مدفوع',paid_payment_id=?,paid_at=?,reference=?,updated_at=? WHERE id=?").bind(paymentId,now,reference,now,installmentId),db.prepare("UPDATE orders SET paid=?,status=?,updated_at=? WHERE id=?").bind(money(newPaid),newPaid===totalCents?"مدفوع":"مدفوع جزئياً",now,orderId),db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'PAY_INSTALLMENT','installment',?,?,?)").bind(id("AUD"),auth.email,installmentId,JSON.stringify({orderId,paymentId,amount:money(installment.amount_cents),reference}),now)]);
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
 if(action==="installment_status"){
  if(!can(auth,"finance.installments.manage"))return Response.json({error:"لا تملكين صلاحية متابعة الأقساط"},{status:403});
  const installmentId=String(body.installmentId||""),status=String(body.status||"");
  if(!["ملتزم","تذكير أول","تذكير ثاني","تذكير ثالث","تذكير نهائي","موافقة تمديد","تطبيق السياسة","متأخر"].includes(status))return Response.json({error:"سلوك السداد غير صالح"},{status:400});
  const reminderCount=status==="تذكير أول"?1:status==="تذكير ثاني"?2:status==="تذكير ثالث"?3:status==="تذكير نهائي"?4:null;
  if(reminderCount)await db.prepare("UPDATE installments SET status=?,reminder_count=MAX(COALESCE(reminder_count,0),?),first_reminder_at=CASE WHEN first_reminder_at IS NULL THEN ? ELSE first_reminder_at END,second_reminder_at=CASE WHEN ?>=2 AND second_reminder_at IS NULL THEN ? ELSE second_reminder_at END,last_reminded_by_email=?,updated_at=? WHERE id=? AND order_id=? AND status!='مدفوع'").bind(status,reminderCount,now,reminderCount,now,auth.email,now,installmentId,orderId).run();
  else await db.prepare("UPDATE installments SET status=?,updated_at=? WHERE id=? AND order_id=? AND status!='مدفوع'").bind(status,now,installmentId,orderId).run();return Response.json({ok:true});
 }
 if(action==="note"){
  const note=String(body.note||"").trim();await db.prepare("INSERT INTO finance_notes(order_id,note,updated_by_email,updated_at) VALUES(?,?,?,?) ON CONFLICT(order_id) DO UPDATE SET note=excluded.note,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(orderId,note,auth.email,now).run();return Response.json({ok:true});
 }
 return Response.json({error:"الإجراء المالي غير صالح"},{status:400});
}
