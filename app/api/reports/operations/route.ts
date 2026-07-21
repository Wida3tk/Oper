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
  db.prepare("SELECT status,SUM(amount) amount,COUNT(*) count FROM payments GROUP BY status").all(),
  db.prepare("SELECT p.name program_name,COUNT(e.id) enrollment_count FROM programs p LEFT JOIN enrollments e ON e.program_id=p.id WHERE p.active=1 GROUP BY p.id,p.name ORDER BY enrollment_count DESC,p.name").all(),
  db.prepare("SELECT COUNT(*) count FROM customers").first(),
  db.prepare("SELECT COUNT(*) count,COALESCE(SUM(total),0) total,COALESCE(SUM(paid),0) paid FROM orders").first()
 ]);
 return Response.json({generatedAt:new Date().toISOString(),prospects:prospects.results,trials:trials.results,reservations:reservations.results,enrollments:enrollments.results,tasks:tasks.results,payments:payments.results,programs:programs.results,customers,orders});
}
