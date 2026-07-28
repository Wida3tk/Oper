import { authorize, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["finance"]);
  if (!auth.ok) return auth.response;

  const db = operationalDb();
  const { results } = await db.prepare(`
    SELECT
      t.id,
      t.status,
      t.target_cohort_label,
      t.requested_by_email,
      t.requested_at,
      t.financial_decision,
      t.reviewed_at,
      c.name customer_name,
      source_program.name source_program_name,
      target_program.name target_program_name,
      r.fee_amount
    FROM reservation_transfers t
    JOIN seat_reservations r ON r.id = t.from_reservation_id
    JOIN customers c ON c.id = r.customer_id
    JOIN programs source_program ON source_program.id = r.program_id
    JOIN programs target_program ON target_program.id = t.target_program_id
    ORDER BY
      CASE WHEN t.status = 'بانتظار المالية' THEN 0 ELSE 1 END,
      t.requested_at DESC
    LIMIT 100
  `).all();

  return Response.json({ transfers: results });
}
