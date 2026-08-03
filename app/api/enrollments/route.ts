import { authorize, operationalDb, promoteDueReservations } from "../_lib/operations";

export const dynamic="force-dynamic";

export async function GET(req:Request){
 const auth=await authorize(req,["academy","sales","finance","viewer"]);if(!auth.ok)return auth.response;
 const db=operationalDb();
 await promoteDueReservations(db,auth.email);
 const {results}=await db.prepare("SELECT e.id,e.status,e.owner_email,e.account_created_at,e.assigned_at,e.access_verified_at,e.started_at,e.completed_at,e.created_at,e.updated_at,c.id customer_id,c.name customer_name,c.phone,c.email,p.id program_id,p.name program_name,o.id order_id,o.purchase_source,o.total,o.paid,(SELECT pay.id FROM payments pay WHERE pay.order_id=o.id ORDER BY CASE WHEN pay.flow_type='sale' THEN 0 ELSE 1 END,COALESCE(pay.paid_at,pay.created_at) LIMIT 1) payment_id,(SELECT pay.reference FROM payments pay WHERE pay.order_id=o.id ORDER BY CASE WHEN pay.flow_type='sale' THEN 0 ELSE 1 END,COALESCE(pay.paid_at,pay.created_at) LIMIT 1) payment_reference FROM enrollments e JOIN customers c ON c.id=e.customer_id JOIN programs p ON p.id=e.program_id JOIN orders o ON o.id=e.order_id ORDER BY e.updated_at DESC").all();
 return Response.json({enrollments:results});
}
