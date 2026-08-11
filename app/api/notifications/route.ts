import { authorize, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["academy"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb();
  const { results } = await db.prepare(`
    SELECT a.id,a.created_at,a.actor_email,
      COALESCE(NULLIF(s.display_name,''),a.actor_email) actor_name,
      c.id customer_id,c.name customer_name,
      p.name program_name,o.order_number
    FROM audit_log a
    JOIN orders o ON o.id=json_extract(a.details,'$.orderId')
    JOIN customers c ON c.id=o.customer_id
    LEFT JOIN programs p ON p.id=o.program_id
    LEFT JOIN staff_accounts s ON s.email=a.actor_email
    WHERE a.action='RECORD_PAYMENT_AND_ADMIT'
      AND a.created_at>=datetime('now','-7 days')
      AND c.deleted_at IS NULL
    ORDER BY a.created_at DESC
    LIMIT 20
  `).all();
  return Response.json({ notifications: results });
}
