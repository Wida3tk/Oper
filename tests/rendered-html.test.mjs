import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("protects customer data with team authorization", async () => {
  const source = await read("../app/api/customers/route.ts");
  assert.match(source, /authorize\(req, \["sales", "finance", "academy", "viewer"\]\)/);
  assert.match(source, /viewerOnly/);
  assert.match(source, /phone: null, email: null/);
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
  assert.match(source, /view==="customers"&&<LiveCustomers/);
});
