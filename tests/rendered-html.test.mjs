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
  assert.match(api, /isObm&&!language/);
  assert.match(api, /orderLanguage=isObm\?language:""/);
  assert.match(page, /isObm && <Field label="اللغة \*">/);
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
  assert.match(intake, /else if\(isAsara\)/);
  assert.match(intake, /status,completed_at,created_at,updated_at/);
  assert.match(intake, /VALUES\(\?,\?,\?,\?,'مكتمل',\?,\?,\?\)/);
  assert.match(intake, /isAsara\?"مكتمل"/);
});
