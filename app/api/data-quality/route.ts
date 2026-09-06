import { authorize, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await authorize(req, []); if (!auth.ok) return auth.response;
  if (!auth.roles.includes("admin")) return Response.json({ error: "مراجعة جودة البيانات متاحة للإدارة فقط" }, { status: 403 });
  const db = operationalDb();
  const { results } = await db.prepare(`SELECT c.id,c.name,c.phone,c.email,c.admitted_via source,o.cohort_label cohort,o.order_number,
    CASE WHEN trim(COALESCE(c.email,''))='' OR c.email NOT LIKE '%@%.%' THEN 'email'
         WHEN c.phone LIKE 'غير متوفر%' OR length(replace(replace(replace(COALESCE(c.phone,''),' ',''),'-',''),'+',''))<9 THEN 'phone'
         WHEN o.id IS NULL THEN 'order' END issue
    FROM customers c LEFT JOIN orders o ON o.id=(SELECT id FROM orders WHERE customer_id=c.id AND status!='محذوف' ORDER BY created_at DESC LIMIT 1)
    WHERE c.deleted_at IS NULL AND ((trim(COALESCE(c.email,''))='' OR c.email NOT LIKE '%@%.%')
      OR c.phone LIKE 'غير متوفر%' OR length(replace(replace(replace(COALESCE(c.phone,''),' ',''),'-',''),'+',''))<9 OR o.id IS NULL)
    ORDER BY CASE WHEN trim(COALESCE(c.email,''))='' OR c.email NOT LIKE '%@%.%' THEN 0 WHEN c.phone LIKE 'غير متوفر%' THEN 1 ELSE 2 END,c.name`).all();
  const { results: historical } = await db.prepare(`SELECT c.id,c.name,COUNT(e.id) open_enrollments FROM customers c JOIN enrollments e ON e.customer_id=c.id
    WHERE c.deleted_at IS NOT NULL AND e.status!='مكتمل' GROUP BY c.id,c.name`).all();
  return Response.json({ issues: results, historical, readOnlyAudit: true });
}
