import { authorize, operationalDb } from "../_lib/operations";

export const dynamic="force-dynamic";

export async function GET(req:Request){
 const auth=await authorize(req,["academy","sales","finance","viewer"]);if(!auth.ok)return auth.response;
 const {results}=await operationalDb().prepare("SELECT e.id,e.status,e.owner_email,e.account_created_at,e.assigned_at,e.access_verified_at,e.started_at,e.completed_at,e.created_at,c.id customer_id,c.name customer_name,c.phone,c.email,p.id program_id,p.name program_name,o.id order_id,o.purchase_source,o.total,o.paid FROM enrollments e JOIN customers c ON c.id=e.customer_id JOIN programs p ON p.id=e.program_id JOIN orders o ON o.id=e.order_id ORDER BY e.updated_at DESC").all();
 return Response.json({enrollments:results});
}
