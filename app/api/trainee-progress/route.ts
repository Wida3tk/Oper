import { authorize, id, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

const stages = ["الممارس", "الخبير / المستشار", "المشروع"];
const statuses = ["لم يبدأ", "قيد التقدم", "بانتظار المتدرب", "مكتمل"];

async function ensureSchema(db: ReturnType<typeof operationalDb>) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS trainee_progress(
    enrollment_id TEXT PRIMARY KEY, stage TEXT NOT NULL DEFAULT 'الممارس', stage_status TEXT NOT NULL DEFAULT 'لم يبدأ',
    note TEXT, stage_started_at TEXT, stage_completed_at TEXT, updated_by_email TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`).run();
}

export async function GET(req: Request) {
  const auth = await authorize(req, ["academy", "viewer", "sales", "finance"]);
  if (!auth.ok) return auth.response;
  const db = operationalDb(); await ensureSchema(db);
  const { results } = await db.prepare(`SELECT e.id enrollment_id,e.customer_id,e.order_id,e.owner_email,e.completed_at activated_at,
    c.name customer_name,c.phone,c.email,p.name program_name,o.order_number,o.track,o.cohort_label,
    COALESCE(tp.stage,'الممارس') stage,COALESCE(tp.stage_status,'لم يبدأ') stage_status,tp.note,tp.stage_started_at,tp.stage_completed_at,tp.updated_by_email,tp.updated_at
    FROM enrollments e JOIN customers c ON c.id=e.customer_id JOIN programs p ON p.id=e.program_id JOIN orders o ON o.id=e.order_id
    LEFT JOIN trainee_progress tp ON tp.enrollment_id=e.id
    WHERE p.name LIKE '%إدارة السلوك التنظيمي%' AND e.status='مكتمل' AND c.deleted_at IS NULL AND o.status!='محذوف'
    ORDER BY CASE COALESCE(tp.stage_status,'لم يبدأ') WHEN 'بانتظار المتدرب' THEN 0 WHEN 'قيد التقدم' THEN 1 WHEN 'لم يبدأ' THEN 2 ELSE 3 END,COALESCE(tp.updated_at,e.completed_at,e.updated_at) DESC`).all();
  return Response.json({ trainees: results, stages, statuses });
}

export async function POST(req: Request) {
  const auth = await authorize(req, ["academy"]); if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>, enrollmentId = String(body.enrollmentId || ""), stage = String(body.stage || ""), status = String(body.status || ""), note = String(body.note || "").trim();
  if (!enrollmentId || !stages.includes(stage) || !statuses.includes(status)) return Response.json({ error: "بيانات مرحلة التقدم غير مكتملة" }, { status: 400 });
  const db = operationalDb(); await ensureSchema(db);
  const eligible = await db.prepare("SELECT 1 ok FROM enrollments e JOIN programs p ON p.id=e.program_id JOIN customers c ON c.id=e.customer_id JOIN orders o ON o.id=e.order_id WHERE e.id=? AND e.status='مكتمل' AND c.deleted_at IS NULL AND o.status!='محذوف' AND p.name LIKE '%إدارة السلوك التنظيمي%'").bind(enrollmentId).first();
  if (!eligible) return Response.json({ error: "المتدرب غير مؤهل لمسار تقدم إدارة السلوك التنظيمي" }, { status: 409 });
  const now = new Date().toISOString(), startedAt = status === "لم يبدأ" ? null : now, completedAt = status === "مكتمل" ? now : null;
  await db.batch([
    db.prepare(`INSERT INTO trainee_progress(enrollment_id,stage,stage_status,note,stage_started_at,stage_completed_at,updated_by_email,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(enrollment_id) DO UPDATE SET stage=excluded.stage,stage_status=excluded.stage_status,note=excluded.note,
      stage_started_at=CASE WHEN trainee_progress.stage!=excluded.stage OR trainee_progress.stage_status='لم يبدأ' THEN excluded.stage_started_at ELSE trainee_progress.stage_started_at END,
      stage_completed_at=excluded.stage_completed_at,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at`)
      .bind(enrollmentId, stage, status, note || null, startedAt, completedAt, auth.email, now, now),
    db.prepare("INSERT INTO audit_log(id,actor_email,action,entity_type,entity_id,details,created_at) VALUES(?,?,'UPDATE_TRAINEE_PROGRESS','enrollment',?,?,?)")
      .bind(id("AUD"), auth.email, enrollmentId, JSON.stringify({ stage, status, note }), now),
  ]);
  return Response.json({ ok: true });
}
