// Synthetic, local-only seed for visual QA of the Operations Dashboard. No real customer data.
// Usage: node seed-synthetic.mjs <path to the local Miniflare D1 .sqlite file under .wrangler/state>
import { createHash, randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const out = process.argv[2] ?? "";
// Creates an admin session, so it must never reach a real database: only local Miniflare state is accepted.
if (!/[\\/]\.wrangler[\\/]state[\\/].+\.sqlite$/.test(out)) throw new Error("Pass the local .wrangler/state/**/*.sqlite file. Remote or production databases are not allowed.");
const MONTH = "2026-10", TODAY = "2026-10-28";
const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);
const ins = (table, row) => `INSERT INTO ${table}(${Object.keys(row).join(",")}) VALUES(${Object.values(row).map(q).join(",")});`;
const sql = [];
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const ts = (day, h = 10, m = 0) => `${MONTH}-${String(day).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00.000Z`;

// Staff (synthetic .test accounts). Session token is printed so the browser can attach it as a cookie.
const QA = "qa.ops@sulukera.test", token = "qa-local-" + randomBytes(16).toString("hex");
const staff = [[QA, "سارة (اختبار)", '["*"]', "admin"], ["sales.qa@sulukera.test", "نورة", '["customers.view"]', "sales"], ["finance.qa@sulukera.test", "خالد", '["finance.view"]', "finance"], ["academy.qa@sulukera.test", "ريم", '["customers.view"]', "academy"]];
for (const [email, name, perms, role] of staff) {
  sql.push(ins("staff_accounts", { email, password_hash: "synthetic-no-login", password_salt: "synthetic", permissions: perms, active: 1, created_at: ts(1), updated_at: ts(1), display_name: name }));
  sql.push(ins("staff_roles", { id: `ROLE-${role}`, email, role, active: 1, granted_by_email: QA, created_at: ts(1), updated_at: ts(1) }));
}
sql.push(ins("staff_sessions", { id: "SESS-QA", email: QA, token_hash: createHash("sha256").update(token).digest("hex"), expires_at: "2027-12-31T00:00:00.000Z", created_at: ts(28) }));

const first = ["ليان", "عبدالله", "مها", "فيصل", "جود", "تركي", "هيا", "سلمان", "دانة", "ماجد", "رهف", "بندر", "لمى", "نواف", "غدير", "مشاري", "أروى", "يزيد", "شهد", "عمر", "وعد", "راكان", "حصة", "زياد"];
const last = ["القحطاني", "الشهري", "العتيبي", "الزهراني", "الدوسري", "الغامدي", "المطيري", "الحربي", "السبيعي", "العنزي"];
const programs = [["PRG-ABA", "تحليل السلوك التطبيقي", ["مسار BCBA", "مسار BCaBA", "مسار RBT"]], ["PRG-OBM", "إدارة السلوك التنظيمي", ["المسار المهني"]], ["PRG-COMP", "تقييم الكفاءة", [""]], ["PRG-BE", "الاقتصاد السلوكي", [""]], ["PRG-CE", "التعليم المستمر", [""]]];
const statuses = ["جديد", "بانتظار إنشاء الحساب", "بانتظار الإسناد", "نشط", "نشط", "نشط"];
const reviewKinds = [["أقساط", "تحويل بنكي"], ["أقساط", "تحويل بنكي"], ["أقساط", "PayTabs"], ["دفعة كاملة", "تحويل بنكي"], ["دفعة كاملة", "تحويل بنكي"], ["دفعة كاملة", "تمارا"]];

const customers = [];
for (let i = 1; i <= 46; i++) {
  const id = `CUS-T${String(i).padStart(3, "0")}`, name = `${first[i % first.length]} ${last[(i * 7) % last.length]}`;
  const createdDay = i > 43 ? 28 : Math.max(1, Math.min(27, Math.round(rnd() * 27)));
  const createdAt = i <= 18 ? `2026-09-${String(1 + (i % 28)).padStart(2, "0")}T09:00:00.000Z` : ts(createdDay, 9 + (i % 8), (i * 13) % 60);
  customers.push({ id, name });
  sql.push(ins("customers", { id, name, phone: `009665500${String(10000 + i).slice(-5)}`, email: `customer${i}@example.test`, customer_type: "مسجل", created_at: createdAt, updated_at: createdAt, deleted_at: null }));
  const [pid, pname, tracks] = pick(programs), track = pick(tracks), total = pid === "PRG-ABA" ? 14500 : pid === "PRG-OBM" ? 9800 : pid === "PRG-COMP" ? 2400 : 1500;
  const pendingReview = i >= 38 && i <= 43 ? reviewKinds[i - 38] : null, plan = pendingReview ? pendingReview[0] : total > 5000 && i % 3 ? "أقساط" : "دفعة كاملة";
  const oid = `ORD-T${String(i).padStart(3, "0")}`;
  sql.push(ins("orders", { id: oid, customer_id: id, program: pname, track, delivery: "عن بعد", language: "العربية", purchase_source: pick(["المنصة", "المتجر", "تسجيل مباشر"]), payment_plan: plan, total, paid: 0, status: "نشط", academy_status: "قيد التهيئة", owner: "غير مسند", competency: 0, seat_reservation: 0, created_at: createdAt, updated_at: createdAt, order_type: "برنامج", program_id: pid, finance_review_status: pendingReview ? "pending" : "approved" }));
  sql.push(ins("enrollments", { id: `ENR-T${String(i).padStart(3, "0")}`, customer_id: id, program_id: pid, order_id: oid, status: pick(statuses), owner_email: "academy.qa@sulukera.test", created_at: createdAt, updated_at: createdAt }));
  if (createdAt.startsWith(MONTH)) {
    const amount = plan === "أقساط" ? Math.round(total * 0.3) : total;
    sql.push(ins("payments", { id: `PAY-S${i}`, order_id: oid, amount, paid_at: createdAt.slice(0, 10), status: "مدفوعة", method: pendingReview ? pendingReview[1] : pick(["PayTabs", "تحويل بنكي", "تمارا"]), reference: `SYN-${1000 + i}`, created_at: createdAt, flow_type: "sale", classification_status: pendingReview ? "pending" : "confirmed" }));
  } else if (plan === "أقساط") {
    // September contracts on installments: a 30% first payment, then four 17.5% installments
    // (paid / late or reminded / due today / upcoming) so the collections screens have every state.
    const first = Math.round(total * 0.3), share = Math.round(total * 0.175), paidFirst = i % 3 === 0;
    sql.push(ins("payments", { id: `PAY-F${i}`, order_id: oid, amount: first, paid_at: createdAt.slice(0, 10), status: "مدفوعة", method: "تحويل بنكي", reference: `SYN-F${i}`, created_at: createdAt, flow_type: "sale", classification_status: "confirmed" }));
    if (paidFirst) sql.push(ins("payments", { id: `PAY-C${i}`, order_id: oid, amount: share, paid_at: "2026-10-05", status: "مدفوعة", method: "تحويل بنكي", reference: `SYN-C${i}`, created_at: ts(5), flow_type: "collection", classification_status: "confirmed" }));
    [["2026-10-05", paidFirst ? "مدفوع" : i % 2 ? "تذكير أول" : "قادم"], [TODAY, "قادم"], ["2026-11-28", "قادم"], ["2026-12-28", "قادم"]].forEach(([due, status], k) =>
      sql.push(ins("installments", { id: `INS-T${i}-${k + 1}`, order_id: oid, sequence: k + 1, amount_cents: share * 100, due_date: due, status, paid_payment_id: k === 0 && paidFirst ? `PAY-C${i}` : null, paid_at: k === 0 && paidFirst ? "2026-10-05" : null, reference: k === 0 && paidFirst ? `SYN-C${i}` : null, created_at: createdAt, updated_at: createdAt })));
  }
}
// One refund-free withdrawal table is created by the API at runtime; targets:
sql.push(`CREATE TABLE IF NOT EXISTS monthly_sales_targets(month_key TEXT PRIMARY KEY,target_amount REAL NOT NULL DEFAULT 0,updated_by_email TEXT NOT NULL,updated_at TEXT NOT NULL);`);
sql.push(`CREATE TABLE IF NOT EXISTS weekly_sales_targets(month_key TEXT NOT NULL,week_index INTEGER NOT NULL,target_amount REAL NOT NULL DEFAULT 0,updated_by_email TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(month_key,week_index));`);
// Mark the one-time legacy reclassification as applied so it does not relabel synthetic sales as legacy.
sql.push(`CREATE TABLE IF NOT EXISTS system_migrations(key TEXT PRIMARY KEY,applied_at TEXT NOT NULL);`);
sql.push(ins("system_migrations", { key: "financial-flow-v1", applied_at: ts(1) }));
sql.push(ins("monthly_sales_targets", { month_key: MONTH, target_amount: 180000, updated_by_email: QA, updated_at: ts(1) }));
[[1, 30000], [2, 35000], [3, 40000], [4, 45000]].forEach(([w, t]) => sql.push(ins("weekly_sales_targets", { month_key: MONTH, week_index: w, target_amount: t, updated_by_email: QA, updated_at: ts(1) })));

const tasks = [["التواصل مع العميل لتأكيد بيانات الحساب", "المبيعات", "عاجلة", "2026-10-28"], ["إنشاء حساب المنصة وإرسال بيانات الدخول", "الأكاديمية", "عاجلة", "2026-10-28"], ["مطابقة تحويل بنكي مع كشف الحساب", "المالية", "عالية", "2026-10-29"], ["إسناد المقررات للدفعة الجديدة", "الأكاديمية", "عالية", "2026-10-30"], ["التحقق من دخول المتدرب للمنصة", "الأكاديمية", "عادية", "2026-10-31"], ["متابعة قسط متأخر", "المالية", "عادية", "2026-11-02"], ["تحديث مرجع السداد", "المالية", "عادية", null], ["متابعة فترة التجربة", "المبيعات", "عادية", "2026-11-03"], ["استكمال بيانات التسجيل", "المبيعات", "عادية", null]];
tasks.forEach(([title, dept, priority, due], i) => sql.push(ins("workflow_tasks", { id: `TSK-T${i + 1}`, entity_type: "customer", entity_id: customers[40 - i * 3].id, department: dept, title, status: "مفتوحة", priority, assignee_email: QA, due_at: due, created_by_email: QA, created_at: ts(20 + (i % 8)) })));

const actions = [["RECORD_PAYMENT_AND_ADMIT", "customer", "sales.qa@sulukera.test"], ["PAY_INSTALLMENT", "order", "finance.qa@sulukera.test"], ["ENROLLMENT_TRANSITION", "enrollment", "academy.qa@sulukera.test"], ["ADD_CUSTOMER_NOTE", "customer", QA], ["RECORD_INSTALLMENT_REMINDER", "order", "finance.qa@sulukera.test"], ["UPDATE_PAYMENT_REFERENCE", "order", "sales.qa@sulukera.test"], ["GRANT_TRIAL", "customer", "sales.qa@sulukera.test"], ["UPDATE_TASK", "customer", "academy.qa@sulukera.test"], ["APPROVE_LEGACY_INSTALLMENTS", "order", "finance.qa@sulukera.test"], ["AUTO_ASSIGN_RESERVATION", "customer", "system@sulukera.test"]];
for (let i = 0; i < 10; i++) {
  const [action, type, actor] = actions[i], c = customers[45 - i * 2], entity = type === "order" ? `ORD-T${c.id.slice(5)}` : type === "enrollment" ? `ENR-T${c.id.slice(5)}` : c.id;
  sql.push(ins("audit_log", { id: `AUD-T${i}`, actor_email: actor, action, entity_type: type, entity_id: entity, details: "{}", created_at: `${TODAY}T${String(13 - i).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}:00.000Z` }));
}
const db = new DatabaseSync(out);
db.exec("BEGIN;" + sql.join("\n") + "COMMIT;");
db.close();
console.log(`applied ${sql.length} statements; cookie sulukera_session=${token}`);
