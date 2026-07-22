import { authorize, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;

  const { results } = await operationalDb().prepare(`
    SELECT c.id,c.name,c.phone,c.email,c.customer_type,c.admitted_via,c.created_at,
           o.id order_id,o.program,o.track,o.purchase_source source,o.owner,
           o.academy_status state,o.status order_status,o.paid,o.total,
           p.name program_name
    FROM customers c
    LEFT JOIN orders o ON o.id=(
      SELECT o2.id FROM orders o2 WHERE o2.customer_id=c.id
      ORDER BY o2.created_at DESC LIMIT 1
    )
    LEFT JOIN programs p ON p.id=o.program_id
    WHERE c.deleted_at IS NULL
    ORDER BY c.created_at DESC
    LIMIT 500
  `).all<Record<string, unknown>>();

  const viewerOnly = auth.roles.includes("viewer") && !auth.roles.some((role) => ["admin", "sales", "finance", "academy"].includes(role));
  const customers = results.map((row) => viewerOnly ? { ...row, phone: null, email: null } : row);
  return Response.json({ customers });
}
