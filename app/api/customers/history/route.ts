import { authorize, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, ["sales", "finance", "academy", "viewer"]);
  if (!auth.ok) return auth.response;
  const customerId = new URL(req.url).searchParams.get("customerId") || "";
  if (!customerId) return Response.json({ error: "معرّف العميل مطلوب" }, { status: 400 });
  const { results } = await operationalDb().prepare(`SELECT a.id,a.actor_email,a.details,a.created_at,s.display_name actor_name
    FROM audit_log a LEFT JOIN staff_accounts s ON s.email=a.actor_email
    WHERE a.entity_type='customer' AND a.entity_id=? AND a.action='UPDATE_CUSTOMER_DATA'
    ORDER BY a.created_at DESC LIMIT 30`).bind(customerId).all();
  return Response.json({ history: results });
}
