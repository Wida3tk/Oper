import { authorize, can, operationalDb } from "../_lib/operations";

export const dynamic = "force-dynamic";

const defaults: Record<string, string> = {
  first: "مرحباً {{اسم_العميل}}،\n\nنود تذكيركم بـ {{نوع_التذكير}} للقسط رقم {{رقم_القسط}} من برنامج {{اسم_البرنامج}}، بقيمة {{المبلغ}}، والمستحق بتاريخ {{تاريخ_الاستحقاق}}.\n\nنأمل التكرم بإتمام السداد، وفي حال تم السداد يرجى تجاهل الرسالة وإرسال مرجع العملية.\n\nشكراً لكم،\nفريق سلوكيرا",
  second: "مرحباً {{اسم_العميل}}،\n\nهذا {{نوع_التذكير}} بخصوص القسط رقم {{رقم_القسط}} من برنامج {{اسم_البرنامج}}، بقيمة {{المبلغ}}، والمستحق بتاريخ {{تاريخ_الاستحقاق}}. المتبقي على البرنامج {{المتبقي}}.\n\nنرجو إتمام السداد وإرسال المرجع.\n\nفريق سلوكيرا",
  third: "مرحباً {{اسم_العميل}}،\n\nنود التنبيه بأن القسط رقم {{رقم_القسط}} بقيمة {{المبلغ}} ما زال مستحقاً منذ {{تاريخ_الاستحقاق}}. هذه الرسالة هي {{نوع_التذكير}}، والمتبقي على برنامج {{اسم_البرنامج}} هو {{المتبقي}}.\n\nيرجى إتمام السداد في أقرب وقت والتواصل معنا عند الحاجة.\n\nفريق سلوكيرا",
  final: "مرحباً {{اسم_العميل}}،\n\nهذا {{نوع_التذكير}} للقسط رقم {{رقم_القسط}} من برنامج {{اسم_البرنامج}} بقيمة {{المبلغ}}، والمستحق بتاريخ {{تاريخ_الاستحقاق}}. إجمالي المتبقي {{المتبقي}}.\n\nيرجى معالجة السداد أو التواصل مع الفريق لتجنب تطبيق سياسة التعثر.\n\nفريق سلوكيرا",
};

async function ensureSchema() {
  await operationalDb().prepare("CREATE TABLE IF NOT EXISTS reminder_message_templates(template_key TEXT PRIMARY KEY,body TEXT NOT NULL,updated_by_email TEXT NOT NULL,updated_at TEXT NOT NULL)").run();
}

export async function GET(req: Request) {
  const auth = await authorize(req, ["finance", "viewer"]);
  if (!auth.ok) return auth.response;
  if (!can(auth, "finance.view")) return Response.json({ error: "ليس لديك صلاحية عرض قوالب التذكير" }, { status: 403 });
  await ensureSchema();
  const { results } = await operationalDb().prepare("SELECT template_key,body FROM reminder_message_templates").all<{template_key:string;body:string}>();
  const templates = { ...defaults };
  for (const row of results) if (row.template_key in templates) templates[row.template_key] = row.body;
  return Response.json({ templates, variables: ["اسم_العميل", "المبلغ", "نوع_التذكير", "رقم_القسط", "اسم_البرنامج", "تاريخ_الاستحقاق", "المتبقي"] });
}

export async function POST(req: Request) {
  const auth = await authorize(req, []);
  if (!auth.ok) return auth.response;
  if (!can(auth, "users.manage")) return Response.json({ error: "تعديل القوالب متاح للإدارة فقط" }, { status: 403 });
  const body = await req.json() as { templates?: Record<string, unknown> };
  const templates = body.templates || {};
  const now = new Date().toISOString();
  const statements = Object.keys(defaults).map((key) => {
    const value = String(templates[key] || "").trim();
    if (!value) throw new Error("جميع قوالب التذكير مطلوبة");
    return operationalDb().prepare("INSERT INTO reminder_message_templates(template_key,body,updated_by_email,updated_at) VALUES(?,?,?,?) ON CONFLICT(template_key) DO UPDATE SET body=excluded.body,updated_by_email=excluded.updated_by_email,updated_at=excluded.updated_at").bind(key, value, auth.email, now);
  });
  await operationalDb().batch(statements);
  return Response.json({ ok: true });
}
