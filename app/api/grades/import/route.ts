import { authorize, id, operationalDb } from "../../_lib/operations";

export const dynamic = "force-dynamic";

type ImportedCourse = {
  studentName?: unknown;
  license?: unknown;
  courseCode?: unknown;
  courseName?: unknown;
  instructorName?: unknown;
  attendanceScore?: unknown;
  homeworkScore?: unknown;
  discussionScore?: unknown;
  finalExamScore?: unknown;
  totalScore?: unknown;
  weeklyGrades?: unknown;
};

const text = (value: unknown) => String(value || "").trim();
const number = (value: unknown) => {
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : 0;
};
const normalizeName = (value: string) => value
  .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
  .replace(/\s+/g, " ").trim().toLowerCase();

async function ensureGradesSchema(db: ReturnType<typeof operationalDb>) {
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS student_course_grades(id TEXT PRIMARY KEY,customer_id TEXT NOT NULL,customer_name TEXT NOT NULL,program_license TEXT,course_code TEXT NOT NULL,course_name TEXT NOT NULL,instructor_name TEXT,attendance_score REAL NOT NULL DEFAULT 0,homework_score REAL NOT NULL DEFAULT 0,discussion_score REAL NOT NULL DEFAULT 0,final_exam_score REAL NOT NULL DEFAULT 0,total_score REAL NOT NULL DEFAULT 0,weekly_grades TEXT NOT NULL DEFAULT '[]',source_file_name TEXT,imported_by_email TEXT NOT NULL,imported_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(customer_id,course_code))"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_student_course_grades_customer ON student_course_grades(customer_id,updated_at DESC)"),
  ]);
}

export async function POST(req: Request) {
  const auth = await authorize(req, ["academy"]);
  if (!auth.ok) return auth.response;
  const body = await req.json() as { fileName?: unknown; courses?: ImportedCourse[] };
  const courses = Array.isArray(body.courses) ? body.courses.slice(0, 80) : [];
  if (!courses.length) return Response.json({ error: "لا توجد درجات قابلة للاستيراد في الملف" }, { status: 400 });
  const db = operationalDb();
  await ensureGradesSchema(db);
  const now = new Date().toISOString(), fileName = text(body.fileName).slice(0, 180);
  const names = [...new Set(courses.map(course => normalizeName(text(course.studentName))).filter(Boolean))];
  const { results: customerRows } = await db.prepare("SELECT id,name FROM customers WHERE name IS NOT NULL AND name!=''").all<{ id: string; name: string }>();
  const customersByName = new Map<string, { id: string; name: string }[]>();
  for (const name of names) {
    const matches = customerRows.filter(customer => normalizeName(customer.name) === name);
    customersByName.set(name, matches);
  }
  const statements: D1PreparedStatement[] = [], skipped: { course: string; student: string; reason: string }[] = [];
  for (const course of courses) {
    const studentName = text(course.studentName), courseCode = text(course.courseCode).toUpperCase(), courseName = text(course.courseName);
    const matches = customersByName.get(normalizeName(studentName)) || [];
    if (!studentName || !courseCode || !courseName) { skipped.push({ course: courseCode || "مقرر غير معروف", student: studentName || "طالب غير معروف", reason: "بيانات الطالب أو المقرر غير مكتملة" }); continue; }
    if (matches.length !== 1) { skipped.push({ course: courseCode, student: studentName, reason: matches.length ? "يوجد أكثر من طالب بالاسم نفسه؛ استخدمي ملفًا يحتوي رقم الجوال أو البريد للمطابقة" : "الطالب غير موجود في قاعدة العملاء" }); continue; }
    const customer = matches[0];
    statements.push(db.prepare("INSERT INTO student_course_grades(id,customer_id,customer_name,program_license,course_code,course_name,instructor_name,attendance_score,homework_score,discussion_score,final_exam_score,total_score,weekly_grades,source_file_name,imported_by_email,imported_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(customer_id,course_code) DO UPDATE SET customer_name=excluded.customer_name,program_license=excluded.program_license,course_name=excluded.course_name,instructor_name=excluded.instructor_name,attendance_score=excluded.attendance_score,homework_score=excluded.homework_score,discussion_score=excluded.discussion_score,final_exam_score=excluded.final_exam_score,total_score=excluded.total_score,weekly_grades=excluded.weekly_grades,source_file_name=excluded.source_file_name,imported_by_email=excluded.imported_by_email,imported_at=excluded.imported_at,updated_at=excluded.updated_at").bind(id("GRD"),customer.id,customer.name,text(course.license)||null,courseCode,courseName,text(course.instructorName)||null,number(course.attendanceScore),number(course.homeworkScore),number(course.discussionScore),number(course.finalExamScore),number(course.totalScore),JSON.stringify(Array.isArray(course.weeklyGrades) ? course.weeklyGrades.slice(0, 30) : []),fileName||null,auth.email,now,now));
  }
  if (statements.length) await db.batch(statements);
  return Response.json({ ok: true, imported: statements.length, skipped });
}
