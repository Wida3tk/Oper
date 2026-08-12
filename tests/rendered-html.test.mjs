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
  assert.match(source, /function LiveCustomers/);
  assert.match(source, /apiJson\("\/api\/customers"\)/);
  assert.match(source, /view\s*===\s*"customers"\s*&&\s*<LiveCustomers/);
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

test("completes Asara registrations without onboarding tasks", async () => {
  const intake = await read("../app/api/intake/route.ts");
  assert.match(intake, /isAsara=source==="عصارة"/);
  assert.match(intake, /else if\(autoAsara\)/);
  assert.match(intake, /status,completed_at,created_at,updated_at/);
  assert.match(intake, /VALUES\(\?,\?,\?,\?,'مكتمل',\?,\?,\?\)/);
  assert.match(intake, /autoAsara\?"مكتمل"/);
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
  assert.match(dashboard, /THEN 'supervision'/);
  assert.match(page, /finance-review-breakdown/);
  assert.match(page, /onOpenFinanceReview/);
  assert.match(page, /financeReviewFilter/);
  assert.match(page, /finance-review-filter/);
  assert.match(page, /reviewTypeFilter/);
});
