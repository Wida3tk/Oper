import { authorize, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";

export async function GET(req:Request){
 const auth=await authorize(req,["finance","viewer"]);if(!auth.ok)return auth.response;
 const db=operationalDb();
 const [payments,summary]=await Promise.all([
  db.prepare("SELECT pi.id payment_intent_id,pi.status reconciliation_status,pi.amount,pi.method,pi.reference,pi.created_at,o.id order_id,o.order_type,c.name customer_name,c.phone,p.name program_name FROM payment_intents pi JOIN orders o ON o.id=pi.resulting_order_id JOIN customers c ON c.id=o.customer_id JOIN programs p ON p.id=pi.program_id ORDER BY pi.created_at DESC LIMIT 200").all(),
  db.prepare("SELECT COALESCE(SUM(amount),0) total,COUNT(*) count,SUM(CASE WHEN status='مطابقة' THEN amount ELSE 0 END) reconciled,SUM(CASE WHEN status='تحتاج مراجعة' THEN amount ELSE 0 END) flagged FROM payment_intents").first()
 ]);
 return Response.json({payments:payments.results,summary});
}
