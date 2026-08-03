import { authorize, operationalDb } from "../../_lib/operations";

export const dynamic="force-dynamic";

export async function GET(req:Request){
 const auth=await authorize(req,["sales","finance","academy","viewer"]);if(!auth.ok)return auth.response;const db=operationalDb();
 const [prospects,trials,reservations,enrollments,tasks,payments,programs,customers,orders]=await Promise.all([
  db.prepare("SELECT status,COUNT(*) count FROM prospects GROUP BY status").all(),
  db.prepare("SELECT status,COUNT(*) count FROM program_trials GROUP BY status").all(),
  db.prepare("SELECT status,COUNT(*) count,SUM(fee_amount) total_fees FROM seat_reservations GROUP BY status").all(),
  db.prepare("SELECT status,COUNT(*) count FROM enrollments GROUP BY status").all(),
  db.prepare("SELECT department,status,COUNT(*) count FROM workflow_tasks GROUP BY department,status").all(),
  db.prepare("SELECT p.status,SUM(p.amount) amount,COUNT(*) count FROM payments p JOIN orders o ON o.id=p.order_id JOIN customers c ON c.id=o.customer_id WHERE c.deleted_at IS NULL GROUP BY p.status").all(),
  db.prepare("SELECT p.name program_name,COUNT(DISTINCT e.id) enrollment_count FROM programs p LEFT JOIN enrollments e ON e.program_id=p.id WHERE p.active=1 GROUP BY p.name ORDER BY enrollment_count DESC,p.name").all(),
  db.prepare("SELECT COUNT(*) count FROM customers WHERE deleted_at IS NULL").first(),
  db.prepare("SELECT COUNT(*) count,COALESCE(SUM(o.total),0) total,COALESCE(SUM(o.paid),0) paid FROM orders o JOIN customers c ON c.id=o.customer_id WHERE c.deleted_at IS NULL").first()
 ]);
 return Response.json({generatedAt:new Date().toISOString(),prospects:prospects.results,trials:trials.results,reservations:reservations.results,enrollments:enrollments.results,tasks:tasks.results,payments:payments.results,programs:programs.results,customers,orders});
}
