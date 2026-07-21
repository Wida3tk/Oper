import { operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = operationalDb();
  const { results } = await db.prepare("SELECT id,code,name,category,default_trial_days trialDays,seat_reservation_fee seatFee,active FROM programs WHERE active=1 ORDER BY name").all();
  return Response.json({ programs: results });
}
