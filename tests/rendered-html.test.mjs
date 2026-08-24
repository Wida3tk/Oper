import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("protects customer data with team authorization", async () => {
  const source = await read("../app/api/customers/route.ts");
  const auth = await read("../app/api/_lib/operations.ts");
  assert.match(source, /authorize\(req, \["sales", "finance", "academy", "viewer"\]\)/);
  assert.match(source, /viewerOnly/);
  assert.match(source, /phone: null, email: null/);
  assert.match(auth, /cf-access-authenticated-user-email/);
  assert.match(auth, /host\.endsWith\("\.workers\.dev"\) \? cloudflareIdentity/);
});

test("records payments and updates the order balance", async () => {
  const source = await read("../app/api/payments/route.ts");
  assert.match(source, /INSERT INTO payments/);
  assert.match(source, /UPDATE orders SET paid=/);
  assert.match(source, /RECORD_PAYMENT/);
});

test("loads the customer directory from the live API", async () => {
  const source = await read("../app/page.tsx");
  const api = await read("../app/api/customers/route.ts");
  assert.match(source, /function LiveCustomers/);
  assert.match(source, /apiJson\("\/api\/customers"\)/);
  assert.match(source, /view\s*===\s*"customers"\s*&&\s*<LiveCustomers/);
  assert.match(api, /LEFT JOIN orders o ON o\.id=\(/);
  assert.match(api, /latest\.payment_plan='رسوم مقعد'/);
});

test("supports a custom final installment while preserving the order balance", async () => {
  const source = await read("../app/api/finance/route.ts");
  assert.match(source, /regularAmountCents=cents\(body\.regularAmount\)/);
  assert.match(source, /finalAmountCents=cents\(body\.finalAmount\)/);
  assert.match(source, /scheduledTotal!==remaining/);
  assert.match(source, /i===count-1\?finalAmountCents:regularAmountCents/);
});

test("stores payment reference links with an audit trail", async () => {
  const source = await read("../app/api/payments/route.ts");
  assert.match(source, /export async function PATCH/);
  assert.match(source, /UPDATE payments SET reference=/);
  assert.match(source, /UPDATE_PAYMENT_REFERENCE/);
});

test("creates readable sequential order numbers by program family", async () => {
  const operations = await read("../app/api/_lib/operations.ts");
  const intake = await read("../app/api/intake/route.ts");
  assert.match(operations, /return "ABA"/);
  assert.match(operations, /return "OBM"/);
  assert.match(operations, /return "CA"/);
  assert.match(operations, /return "CEU"/);
  assert.match(operations, /order_number_sequences/);
  assert.match(intake, /nextOrderNumber/);
});

test("shows whether each enrolled program is live or recorded", async () => {
  const api = await read("../app/api/enrollments/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(api, /o\.delivery program_delivery/);
  assert.match(page, /ops-program-delivery/);
  assert.match(page, /نمط البرنامج/);
});

test("offers competency assessment only with the ABAT track", async () => {
  const api = await read("../app/api/intake/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(api, /competencyAssessment&&!isAbat/);
  assert.match(api, /competency_assessment/);
  assert.match(page, /مع تقييم كفاءة/);
  assert.match(page, /isAbat &&/);
});

test("limits language selection to organizational behavior management", async () => {
  const api = await read("../app/api/intake/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(api, /isObm&&!isSupervision&&!language/);
  assert.match(api, /orderLanguage=isObm\?language:""/);
  assert.match(page, /isObm && !isSupervision && <Field label="اللغة \*">/);
  assert.match(page, /نوع الاشتراك \*/);
});

test("calculates payment behavior from installments and recorded reminders", async () => {
  const finance = await read("../app/api/finance/route.ts");
  const operations = await read("../app/api/_lib/operations.ts");
  assert.match(finance, /function paymentBehavior/);
  assert.match(finance, /RECORD_INSTALLMENT_REMINDER/);
  assert.match(finance, /تذكير ثاني/);
  assert.match(finance, /تذكير نهائي/);
  assert.match(finance, /موافقة تمديد/);
  assert.match(operations, /reminder_count/);
});

test("completes ordinary Asara registrations but keeps competency assessment operational", async () => {
  const intake = await read("../app/api/intake/route.ts");
  const transition = await read("../app/api/enrollments/transition/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(intake, /isAsara=source==="عصارة"/);
  assert.match(intake, /else if\(autoAsara&&!isCompetencyService\)/);
  assert.match(intake, /status,completed_at,created_at,updated_at/);
  assert.match(intake, /VALUES\(\?,\?,\?,\?,'مكتمل',\?,\?,\?\)/);
  assert.match(intake, /autoAsara&&!isCompetencyService\?"مكتمل"/);
  assert.match(page, /إضافة خدمة التقييم/);
  assert.match(page, /ربط المقيم وإكمال التقييم/);
  assert.match(transition, /ربط المقيم وإكمال تقييم الكفاءة/);
});

test("routes supervision through onboarding and collection without course activation", async () => {
  const intake = await read("../app/api/intake/route.ts");
  const transition = await read("../app/api/enrollments/transition/route.ts");
  const finance = await read("../app/api/finance/route.ts");
  const operations = await read("../app/api/_lib/operations.ts");
  const page = await read("../app/page.tsx");
  assert.match(page, /selectedProgram\?\.name\.includes\("الإشراف"\)/);
  assert.match(intake, /program\.name\.includes\("الإشراف"\)/);
  assert.match(operations, /'PRG-SUP','SUP','الإشراف'/);
  assert.match(intake, /isSupervision\?50/);
  assert.match(intake, /isSupervision\?"collection":"sale"/);
  assert.match(transition, /enrollment\.order_type==="إشراف"/);
  assert.match(transition, /to:"مكتمل",column:"completed_at"/);
  assert.match(finance, /order\.order_type,first/);
});

test("keeps subscription type to subscription and trial only", async () => {
  const page = await read("../app/page.tsx");
  assert.doesNotMatch(page, /<option>برنامج مباشر<\/option>/);
  assert.doesNotMatch(page, /<option>إشراف<\/option>/);
  assert.match(page, /<option>اشتراك<\/option>/);
  assert.match(page, /<option>تجربة<\/option>/);
});

test("shows seat reservation for eligible live ABA and OBM programs", async () => {
  const intake = await read("../app/api/intake/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(page, /form\.delivery === "مباشر"/);
  assert.match(page, /هل تم حجز المقعد/);
  assert.match(intake, /delivery==="مباشر"&&\["تحليل السلوك التطبيقي","إدارة السلوك التنظيمي"\]/);
  assert.doesNotMatch(intake, /!isAsara&&delivery==="مباشر"/);
});

test("treats competency assessment as a standalone service without journey or delivery controls", async () => {
  const intake = await read("../app/api/intake/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(page, /isCompetencyService/);
  assert.match(page, /!isStandaloneService && <Field label="نوع الاشتراك/);
  assert.match(page, /!isAbat && !isStandaloneService && <Field label="نمط البرنامج/);
  assert.match(intake, /isCompetencyService\?"خدمة"/);
  assert.match(intake, /الخدمات المستقلة لا تدعم نوع التجربة/);
});

test("requires a clear course name for recorded continuing education", async () => {
  const page = await read("../app/page.tsx");
  assert.match(page, /<Field label="اسم الدورة \*">/);
  assert.match(page, /placeholder="يرجى إضافة اسم الدورة"/);
  assert.match(page, /isContinuingEducation && !form\.track\.trim\(\)/);
});

test("separates legacy seat fees from both contract and first payment", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /"separate_legacy_seat_fee","set_legacy_seat_fee"/);
  assert.match(api, /deltaCents=feeCents-previousFeeCents/);
  assert.match(api, /newTotalCents=totalCents-deltaCents,newFirstCents=firstCents-deltaCents,newPaidCents=paidCents-deltaCents/);
  assert.match(page, /حفظ تعديل الرسوم/);
  assert.match(page, /بقاء المتبقي والأقساط كما هي/);
});

test("shows a visible confirmation after financial and operational updates", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /sulukera:success/);
  assert.match(page, /تم تحديث جدول الأقساط/);
  assert.match(page, /تم تنفيذ الإجراء بنجاح/);
  assert.match(page, /role="status" aria-live="polite"/);
});

test("allows finance to update the actual payment date independently", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /action==="update_payment_date"/);
  assert.match(api, /UPDATE_PAYMENT_DATE/);
  assert.match(page, /تاريخ الاستحقاق/);
  assert.match(page, /تاريخ السداد الفعلي/);
});

test("allows finance to update installment due dates used by forecasts", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /action==="update_installment_due_date"/);
  assert.match(api, /UPDATE_INSTALLMENT_DUE_DATE/);
  assert.match(page, /update_installment_due_date/);
  assert.match(page, /installmentDueDates/);
});

test("lets finance set the visible payment date on the financial record", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /action==="update_payment_record_date"/);
  assert.match(api, /UPDATE_PAYMENT_RECORD_DATE/);
  assert.match(page, /finance-payment-date/);
  assert.match(page, /تاريخ السداد/);
  assert.match(page, /selectedPaymentRecordId/);
  assert.match(page, /payment\.id === selectedPaymentRecordId/);
});

test("loads the saved installment split instead of proposing a new schedule", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /syncScheduleFromSavedTable/);
  assert.match(page, /setCount\(String\(openInstallments\.length\)\)/);
  assert.match(page, /setRegularAmountInput/);
  assert.match(page, /setFinalAmount/);
  assert.match(page, /setScheduleEdit\("existing"\)/);
});

test("supports an audited undo for recent financial mistakes", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /action==="undo_last_finance_action"/);
  assert.match(api, /finance_undo_log/);
  assert.match(api, /UNDO_FINANCE_ACTION/);
  assert.match(page, /تراجع عن آخر إجراء/);
  assert.match(page, /سيُحفظ التراجع في سجل النظام/);
});

test("shows subscription classification and delivery on finance cards", async () => {
  const api = await readFile(new URL("../app/api/finance/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(api, /o\.track program_track,o\.delivery program_delivery/);
  assert.match(page, /المسار:/);
  assert.match(page, /النمط:/);
  assert.match(page, /مع تقييم كفاءة/);
});

test("renders the finance customer profile professionally with an LTR phone", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(page, /finance-customer-profile/);
  assert.match(page, /finance-profile-phone/);
  assert.match(page, /dir="ltr">\{selected\.phone\}/);
  assert.match(css, /unicode-bidi:embed/);
});

test("aligns paid installment details as a compact right-side panel", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.installment-list>article>\.paid-ref\{width:min\(100%,500px\)/);
  assert.match(css, /margin-left:auto/);
  assert.match(css, /border-right:1px solid #c8e7d7/);
});

test("shows and edits the customer cohort from the customer card", async () => {
  const api = await readFile(new URL("../app/api/customers/route.ts", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /رقم الدفعة/);
  assert.match(page, /إضافة رقم الدفعة/);
  assert.match(page, /CustomerCohortEditor/);
  assert.match(api, /cohort_label=\?/);
  assert.match(api, /UPDATE_CUSTOMER_DATA/);
});

test("uses readable order numbers and hides cohorts for recorded programs", async () => {
  const page = await read("../app/page.tsx");
  const api = await read("../app/api/customers/route.ts");
  assert.match(api, /o\.order_number/);
  assert.match(api, /ensureOrderNumberSchema/);
  assert.match(page, /row\.order_number \|\| row\.order_id/);
  assert.match(page, /selectedDetails\.delivery !==/);
});

test("separates pending finance reviews by transaction type", async () => {
  const dashboard = await read("../app/api/dashboard/home/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(dashboard, /reviewBreakdown/);
  assert.match(dashboard, /THEN 'installments'/);
  assert.match(dashboard, /THEN 'bank'/);
  assert.match(dashboard, /THEN 'paytabs'/);
  assert.match(dashboard, /THEN 'tamara'/);
  assert.match(dashboard, /THEN 'supervision'/);
  assert.match(page, /finance-review-breakdown/);
  assert.match(page, /onOpenFinanceReview/);
  assert.match(page, /financeReviewFilter/);
  assert.match(page, /finance-review-filter/);
  assert.match(page, /reviewTypeFilter/);
  assert.match(page, /\["tamara","تمارا"\]/);
});

test("routes Tamara payments to finance review", async () => {
  const intake = await read("../app/api/intake/route.ts");
  assert.match(intake, /\["تحويل بنكي", "Paytabs", "تمارا"\]\.includes\(method\)/);
  assert.match(intake, /مراجعة عملية تمارا/);
});

test("records withdrawals as audited refunds without deleting payments", async () => {
  const finance = await read("../app/api/finance/route.ts");
  const dashboard = await read("../app/api/dashboard/home/route.ts");
  const reports = await read("../app/api/reports/export/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(finance, /CREATE TABLE IF NOT EXISTS withdrawals/);
  assert.match(finance, /action==="register_withdrawal"/);
  assert.match(finance, /UPDATE installments SET status='ملغي'/);
  assert.match(finance, /UPDATE orders SET paid=\?,status='منسحب'/);
  assert.match(finance, /REGISTER_WITHDRAWAL/);
  assert.doesNotMatch(finance, /register_withdrawal[\s\S]{0,3000}DELETE FROM payments/);
  assert.match(dashboard, /salesRefunds/);
  assert.match(dashboard, /collectionRefunds/);
  assert.match(reports, /withdrawals/);
  assert.match(page, /اعتماد الانسحاب والاسترداد/);
});

test("keeps B2B commercial values outside core sales and collection ledgers", async () => {
  const b2b = await read("../app/api/b2b/route.ts");
  const finance = await read("../app/api/finance/route.ts");
  assert.match(b2b, /CREATE TABLE IF NOT EXISTS b2b_partnerships/);
  assert.match(b2b, /CREATE TABLE IF NOT EXISTS b2b_opportunities/);
  assert.doesNotMatch(b2b, /INSERT INTO payments/);
  assert.doesNotMatch(b2b, /INSERT INTO orders/);
  assert.doesNotMatch(finance, /b2b_partnerships|b2b_opportunities/);
});

test("scopes B2B organizations to the assigned employee and exposes dashboard progress", async () => {
  const b2b = await read("../app/api/b2b/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(b2b, /CREATE TABLE IF NOT EXISTS b2b_teams/);
  assert.match(b2b, /CREATE TABLE IF NOT EXISTS b2b_assignments/);
  assert.match(b2b, /owner_email=\? OR EXISTS\(SELECT 1 FROM b2b_assignments/);
  assert.match(b2b, /الجهة غير متاحة ضمن نطاق عملك/);
  assert.match(page, /تقدم فرص الشراكة/);
  assert.match(page, /تم التواصل اليوم/);
  assert.match(page, /b2b-inline-stage/);
});

test("requires B2B employee submissions to be approved and restricts direct partnership creation", async () => {
  const b2b = await read("../app/api/b2b/route.ts");
  const staff = await read("../app/api/staff/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(b2b, /approval_status TEXT NOT NULL DEFAULT 'approved'/);
  assert.match(b2b, /action==="review_business"/);
  assert.match(b2b, /autoApprove=isAdmin\(auth\)\|\|can\(auth,"b2b.review"\)/);
  assert.match(b2b, /action==="create_partnership"/);
  assert.match(b2b, /b2b.partnerships.create/);
  assert.match(staff, /b2b.review/);
  assert.match(staff, /b2b.partnerships.create/);
  assert.match(page, /إرسال الجهة للاعتماد/);
  assert.match(page, /بانتظار الاعتماد/);
});

test("tracks direct corporate training requests without converting them to partnerships", async () => {
  const b2b = await read("../app/api/b2b/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(b2b, /opportunity_kind TEXT NOT NULL DEFAULT 'partnership'/);
  assert.match(b2b, /trainee_count INTEGER/);
  assert.match(b2b, /requested_program TEXT/);
  assert.match(b2b, /trainingStages/);
  assert.match(b2b, /طلبات التدريب المؤسسي تُغلق بالتنفيذ ولا تتحول إلى شراكات/);
  assert.match(page, /طلب تدريب مؤسسي/);
  assert.match(page, /عدد المتدربين/);
  assert.match(page, /طلبات الجهات/);
});

test("allows only admins to cascade-delete a B2B organization with an audit record", async () => {
  const b2b = await read("../app/api/b2b/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(b2b, /export async function DELETE/);
  assert.match(b2b, /if\(!isAdmin\(auth\)\)/);
  assert.match(b2b, /DELETE FROM b2b_activities WHERE account_id/);
  assert.match(b2b, /DELETE FROM b2b_partnerships WHERE account_id/);
  assert.match(b2b, /DELETE FROM b2b_opportunities WHERE account_id/);
  assert.match(b2b, /DELETE_B2B_ACCOUNT/);
  assert.match(page, /حذف الجهة نهائيًا/);
  assert.match(page, /window\.confirm/);
});

test("lets finance apply a custom discount and rebalance open installments", async () => {
  const finance = await read("../app/api/finance/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(finance, /action==="update_discount_percent"/);
  assert.match(finance, /discountPercent<0\|\|discountPercent>100/);
  assert.match(finance, /UPDATE installments SET amount_cents/);
  assert.match(finance, /UPDATE_DISCOUNT_PERCENT/);
  assert.match(page, /finance-discount-editor/);
  assert.match(page, /step="0\.01" value=\{customDiscount\}/);
  assert.match(finance, /auth\.roles\.includes\("finance"\).*finance\.total\.edit/);
});

test("keeps payment references and customer notes actionable near the top of cards", async () => {
  const page = await read("../app/page.tsx");
  const notes = await read("../app/api/customers/notes/route.ts");
  const css = await read("../app/globals.css");
  assert.match(page, /className="finance-card-reference"/);
  assert.match(page, /orderId=\{selected\.order_id\}/);
  assert.match(page, /selectedReferencePayment\?\.reference \|\| selected\.order_payment_reference/);
  const financeApi = await read("../app/api/finance/route.ts");
  assert.match(financeApi, /CREATE TABLE IF NOT EXISTS order_payment_references/);
  assert.match(financeApi, /action==="update_order_payment_reference"/);
  assert.match(page, /<Section title="ملاحظات العميل">\s*<CustomerNotes customerId=\{selected\.customer_id\}/);
  assert.match(notes, /authorize\(req, \["sales", "finance", "academy"\]\)/);
  assert.match(page, /className="customer-note-latest"/);
  assert.match(page, /className="customer-note-archive"/);
  assert.match(page, /profile-delivery.*selectedRow\.program_delivery/);
  assert.match(page, /selectedRow\.created_at.*أضيف في/);
  assert.match(css, /operations-drawer \.detail-contact>div\{display:flex;min-width:0;min-height:94px/);
});

test("prevents duplicate intake submissions and recent repeated registrations", async () => {
  const intake = await read("../app/api/intake/route.ts");
  const page = await read("../app/page.tsx");
  assert.match(intake, /CREATE TABLE IF NOT EXISTS intake_submissions/);
  assert.match(intake, /submission_key TEXT PRIMARY KEY/);
  assert.match(intake, /created_at>=datetime\('now','-10 minutes'\)/);
  assert.match(page, /submissionKey: currentSubmissionKey/);
  assert.match(page, /crypto\.randomUUID\(\)/);
});

test("routes every eligible direct program to program activation", async () => {
  const page = await read("../app/page.tsx");
  const transition = await read("../app/api/enrollments/transition/route.ts");
  assert.match(page, /const isDirectProgram = \(row: LiveEnrollment\) =>/);
  assert.match(page, /focus === "program-activation" \? isDirectProgram\(row\)/);
  assert.match(page, /row\.order_type !== "إشراف"/);
  assert.match(page, /\["الاقتصاد السلوكي", "انتقائية الطعام"\]\.includes\(row\.program_name\)/);
  assert.doesNotMatch(page, /focus === "program-activation" && status === "تم الإسناد"/);
  assert.match(transition, /activated:\{from:\["اكتمل التسجيل","تم إنشاء الحساب"\]/);
});

test("offers track filtering for ABA and OBM operational lists", async () => {
  const page = await read("../app/page.tsx");
  assert.match(page, /const pathFilterPrograms = \["تحليل السلوك التطبيقي", "إدارة السلوك التنظيمي", "التعليم المستمر"\]/);
  assert.match(page, /tertiaryLabel=\{programFilter === "التعليم المستمر" \? "البرنامج الفرعي" : "المسار"\}/);
  assert.match(page, /programPathLabel\(row\) === subprogramFilter/);
});

test("keeps navigation counters aligned with their operational queues", async () => {
  const page = await read("../app/page.tsx");
  const css = await read("../app/globals.css");
  assert.match(page, /const isDirectActivation = \(row: LiveEnrollment\) =>/);
  assert.match(page, /\["اكتمل التسجيل", "تم إنشاء الحساب"\]\.includes\(row\.status\) && !isDirectActivation\(row\)/);
  assert.match(page, /isDirectActivation\(row\) && \["اكتمل التسجيل", "تم إنشاء الحساب"\]\.includes\(row\.status\)/);
  assert.match(css, /nav-group:not\(\.expanded\):not\(\.static\) \.nav-group-items>button\{height:0!important/);
  assert.match(css, /background:#3b82a0!important/);
  assert.match(page, /id === "work"\s*\? undefined/);
});

test("opens a complete student file from seat reservations", async () => {
  const page = await read("../app/page.tsx");
  const reservations = await read("../app/api/reservations/route.ts");
  assert.match(page, /فتح ملف الطالب/);
  assert.match(page, /<CircleUserRound size=\{16\}\/>فتح ملف الطالب/);
  assert.doesNotMatch(page, /<UserRound size=/);
  assert.match(page, /className="drawer operations-drawer reservation-customer-drawer"/);
  assert.match(page, /<CustomerNotes customerId=\{selectedReservation\.customer_id\}/);
  assert.match(page, /selectedReservation\.phone/);
  assert.match(page, /selectedReservation\.email/);
  assert.match(reservations, /o\.track program_track,o\.delivery program_delivery,o\.purchase_source,o\.order_number/);
});

test("builds the five-stage B2B partnership lifecycle with gated approvals", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  assert.match(page, /الاستكشاف والتقييم/);
  assert.match(page, /التفاوض والهيكلة/);
  assert.match(page, /التفعيل والعمليات/);
  assert.match(page, /قياس الأثر/);
  assert.match(page, /التجديد أو الخروج/);
  assert.match(page, /b2b-kanban/);
  assert.match(b2b, /update_lifecycle/);
  assert.match(b2b, /اتفاقية السرية NDA/);
  assert.match(b2b, /fit_decision/);
});

test("keeps B2B governance documents and finance isolated inside the partnership file", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  assert.match(page, /مركز المستندات/);
  assert.match(page, /بوابات الموافقة/);
  assert.match(page, /المؤشرات المالية للشراكة/);
  assert.match(page, /مستقلة تمامًا عن مبيعات وتحصيل الأفراد/);
  assert.match(b2b, /b2b_partnership_finance/);
  assert.match(b2b, /record_approval/);
});

test("starts partnerships with optional initial compatibility data", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  assert.match(page, /المرحلة الأولى · البيانات الأولية/);
  assert.match(page, /عميل سابق","قاعدة بيانات سلوكيرا","طلب وارد/);
  assert.match(page, /مذكرة تفاهم","شراكة تدريب","اتفاقية تسويق/);
  assert.match(page, /<option value="BOTH">جميع المجالات<\/option>/);
  assert.match(page, /action:"create_partnership_initial"/);
  assert.match(b2b, /partnership_type TEXT/);
  assert.match(b2b, /contact_status TEXT/);
  assert.match(b2b, /stage:'?مرحلة الملاءمة'?|مرحلة الملاءمة/);
  assert.doesNotMatch(b2b, /create_partnership_initial[\s\S]{0,700}اسم الجهة والمسؤول وتواريخ الاتفاقية مطلوبة/);
});

test("tracks partnership contact meetings fit decisions and agreement milestones", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  const css = await read("../app/globals.css");
  assert.match(page, /لم يتم التواصل.*تم التواصل الأول.*في انتظار الرد.*تم تحديد اجتماع.*تم الاجتماع/s);
  assert.match(page, /محضر الاجتماع/);
  assert.match(page, /الحضور من سلوكيرا/);
  assert.match(page, /اعتماد","رفض","تأجيل/);
  assert.match(page, /إرسال النموذج.*تعبئة النموذج.*إرسال الاتفاقية.*توقيع الاتفاقية/s);
  assert.match(page, /partnership-decisions-overview/);
  assert.match(b2b, /update_partnership_pipeline/);
  assert.match(b2b, /fit_decided_by_email/);
  assert.match(css, /partnership-card-progress/);
});

test("persists multiple B2B meeting minutes and unlocks approved lifecycle transitions", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  assert.match(b2b, /CREATE TABLE IF NOT EXISTS b2b_meeting_minutes/);
  assert.match(b2b, /INSERT INTO b2b_meeting_minutes/);
  assert.match(b2b, /SELECT \* FROM b2b_meeting_minutes/);
  assert.match(b2b, /target==="التفاوض والهيكلة"&&row\.fit_decision!=="اعتماد"/);
  assert.match(page, /محاضر الاجتماعات السابقة/);
  assert.match(page, /setMeetingMinutes\(data\.meetings\|\|\[\]\)/);
  assert.match(page, /canConvert=\{has\("b2b\.partnerships\.manage"\)\|\|has\("b2b\.manage"\)\}/);
});

test("edits B2B organization and contact data with an audit trail", async () => {
  const page = await read("../app/page.tsx");
  const b2b = await read("../app/api/b2b/route.ts");
  assert.match(page, /تعديل البيانات/);
  assert.match(page, /saveAccount/);
  assert.match(page, /اسم مسؤول الجهة/);
  assert.match(b2b, /action==="update_account"/);
  assert.match(b2b, /UPDATE_B2B_ACCOUNT/);
  assert.match(b2b, /تعديل بيانات الجهة/);
});
