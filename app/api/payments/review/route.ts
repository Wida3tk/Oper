import { authorize, id, operationalDb } from "../../_lib/operations";

export const dynamic="force-dynamic";

// Finance reconciles and organizes a recorded payment. This action never gates
// customer admission and never cancels an enrollment or reservation.
export async function POST(req:Request){
 const auth=await authorize(req,["finance"]);if(!auth.ok)return auth.response;
 const body=await req.json() as Record<string,unknown>,paymentIntentId=String(body.paymentIntentId||""),action=String(body.action||"");
 if(!paymentIntentId||!["reconcile","flag"].includes(action))return Response.json({error:"إجراء المالية غير صالح"},{status:400});
 const db=operationalDb(),intent=await db.prepare("SELECT id,status,resulting_order_id FROM payment_intents WHERE id=?").bind(paymentIntentId).first<{id:string,status:string,resulting_order_id:string}>();
 if(!intent)return Response.json({error:"الدفعة غير موجودة"},{status:404});
 const now=new Date().toISOString(),note=String(body.note||"").trim(),status=action==="reconcile"?"مطابقة":"تحتاج مراجعة";
 if(action==="flag"&&!note)return Response.json({error:"الملاحظة مطلوبة"},{status:400});
 await db.batch([
  db.prepare("UPDATE payment_intents SET status=?,reviewed_by_finance_email=?,reviewed_at=?,rejection_reason=?,updated_at=? WHERE id=?").bind(status,auth.email,now,action==="flag"?note:null,now,paymentIntentId),
  db.prepare("UPDATE workflow_tasks SET status=?,completed_at=? WHERE entity_type='payment' AND entity_id IN (SELECT id FROM payments WHERE order_id=?) AND status!='مكتملة'").bind(action==="reconcile"?"مكتملة":"تحتاج متابعة",action==="reconcile"?now:null,intent.resulting_order_id),
  db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'RECONCILE_PAYMENT','payment_intent',?,?,?)").bind(id("AUD"),auth.email,paymentIntentId,JSON.stringify({action,note,status}),now)
 ]);
 return Response.json({ok:true,status});
}
