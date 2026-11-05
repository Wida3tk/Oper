# Handoff: continuing the redesign on another machine

> لمتابعة العمل في جلسة جديدة: افتح المشروع على هذا الفرع واكتب لـ Claude:
> «اقرأ `docs/dashboard-redesign/HANDOFF.md` والملفات المذكورة فيه، ثم كمّل من حيث توقفنا.»

## Where things stand (2026-10-28)

- Branch `design/premium-operations-dashboard`, cut from `main` at `e00b1ea`. The dashboard redesign is
  done and committed. The user reviewed it and approved committing it.
- **Update (2026-10-28, second machine):** the user approved extending the design. Phase 0 (Shell) is done
  and committed on `design/phase-0-shell` (cut from this branch at `ac9335a`). See
  [PHASE-0-SHELL.md](PHASE-0-SHELL.md). The user then approved Phase 1 (Operations Center), committed on the
  same branch at the user's request. See [PHASE-1-OPERATIONS-CENTER.md](PHASE-1-OPERATIONS-CENTER.md), including
  the suggestions waiting for the user's decision. Phase 2 (Customers) followed on the same branch: see [PHASE-2-CUSTOMERS.md](PHASE-2-CUSTOMERS.md). Phase 3 started with the academy pages (onboarding review and fixes): see [PHASE-3-ACADEMY.md](PHASE-3-ACADEMY.md), The academy-permission question is resolved: real academy accounts see the page.

## Released (2026-10-28, at the user's request)

- `design/phase-0-shell` was fast-forwarded into `main` (`9feeded` → `ad619fa`). That also brought the 28 September
  commits that had been on the first machine's local `main` only.
- Deployed to Cloudflare Workers with `npx wrangler deploy --config wrangler.deploy.jsonc` from `ad619fa`:
  version `3b8dcd9e-f537-4177-aed9-8a2498358f7c` at https://sulukera-operations.ro7e-entaa.workers.dev.
  Checked: home 200, new CSS served, API 401 without a session. The user then signed in and confirmed the dashboard, Operations Center, customers and onboarding work on the live site.
- Previous live version, for rollback: `bb58c5db-8d9c-411e-9cce-186111b241a7` (deployed 2026-10-28 07:02 UTC by an
  external tool, contents unknown). Roll back with:
  `npx wrangler rollback bb58c5db-8d9c-411e-9cce-186111b241a7 --config wrangler.deploy.jsonc`
- From now on, merge and deploy only when the user asks, as they did here.

## Released again (2026-10-28 evening, home machine, at the user's request)

- **Every push to GitHub deploys to production automatically, on any branch.** This was found while
  preparing this release. Each push to `design/phase-0-shell` today was live one to two minutes later
  (pushes at 16:39, 17:07, 17:18, 23:00 and 23:04 UTC+5 → deployments at 16:42, 17:08, 17:20, 23:02 and 23:06). The
  office pushes match the 09:20–09:42 UTC deployments too. Nobody ran `wrangler deploy` by hand. The likely cause is
  Cloudflare's Git integration (Workers Builds) deploying non-production branches. This is not confirmed: the
  dashboard was not checked. Earlier notes saying the registration work was "branch only, not deployed" were wrong.
  **Until the user changes this in Cloudflare (Workers & Pages → sulukera-operations → Settings → Builds), treat any
  push, to any branch, as a production release.**
- `design/phase-0-shell` was fast-forwarded into `main` (`d9d1602` → this commit) and pushed, so GitHub `main`
  matches what is live. Before the merge, live was version `0f568512-f4de-47b5-9fa5-837d798f5798` (same code,
  deployed from the branch). The push of `main` deploys the same code again. `npx wrangler deployments list
  --config wrangler.deploy.jsonc` shows its version ID.
- Live after the merge: version `cd37fcd2-7bc8-439f-b41e-83716d6fc27e` (18:15 UTC). Checked: home 200, today's
  features in the served code, APIs 401 without a session. The user then signed in and confirmed the site works.
- What this release carries over the morning one: the registration redesign and data map, the existing-customer
  alert, the seller in `orders.owner`, store order numbers, the seat-fee and list-price suggestions, assignment-date
  holding, supervision without a cohort, and the before/after-VAT amounts (see [REGISTRATION.md](REGISTRATION.md)).
  New tables (`program_prices`) are created by the app on first use. No `drizzle/` migrations.
- **Rollback** to the last version built from the morning's `main` (`d9d1602`, deployed 07:19:59 UTC):
  `npx wrangler rollback c7e49602-4eed-404e-ae00-fd66a85675b7 --config wrangler.deploy.jsonc`.
  A rollback restores the code only. Data written since then stays: new orders' `owner`, `program_prices`, and
  reservations waiting for their assignment date. The old code moves those waiting reservations into onboarding
  at once (its old behaviour) and ignores the rest.

## Where we stopped (2026-11-05): start here next

- **Live = `main` = `design/phase-0-shell`.** Last release: the finance role's permissions (see below). Everything
  is pushed and nothing is waiting on the branch.
- **After the 2026-11-03 release:** check this month's weekly targets. They are stored by week number, and the
  weeks now run Saturday to Friday from day 1 ([HOME-AUDIT.md](HOME-AUDIT.md)).
- **Done on 2026-10-29:**
  - Phase 4 Finance ([PHASE-4-FINANCE.md](PHASE-4-FINANCE.md)): list, file layout, transfer card, and
    before/after-VAT amounts.
  - A finance calculations audit and its fixes ([FINANCE-AUDIT.md](FINANCE-AUDIT.md)).
- **Waiting for the user's answer:**
  1. **Audit #3b:** should a seat fee paid with registration be recorded as its own payment
     (`flow_type = 'seat_fee'`) so it counts in finance totals? Today it shows in the file but is in no total.
  2. **Audit #5:** roughly how many orders are in production? `GET /api/finance` loads only the latest 200.
     If there are more, compute the totals over all orders.
- **Next phases:** 6 (Programs/Users/Control/Reports), 7 (clean-up). Small items: registration's
  default purchase date still uses the device date, and «انتقائية الطعام» has no list price yet.
- **Remember:** every push to GitHub (any branch) deploys to production. Ask before pushing.

## Released: the finance role's permissions (2026-11-05, at the user's request)

- **What changed.** Anyone with the `finance` role now always has `customers.view`, `customers.manage`,
  `finance.view`, `finance.total.edit`, `finance.installments.manage` and `finance.payments.record`, on the server
  (`can()` in `app/api/_lib/operations.ts`) and in the screens (`has()` in `app/page.tsx`).
- **Consequence.** Unticking those permissions for a finance user in the users screen no longer limits them. To
  limit such a user, remove the `finance` role. Through these permissions they can also edit discounts and contract
  totals, edit and undo financial operations, register withdrawals and refunds, and set sales targets. No other
  role changes.
- **Where it came from.** The change sat uncommitted in the home machine's checkout from 2026-11-02 21:46 (+05:00)
  and was not in the 2026-11-03 release. Versions `3d318b82` and `6f87353c` went out minutes later that evening
  with no matching commit. Whether they carried it could not be confirmed.
- **Checked on synthetic local data** with accounts that have no individual permissions:

  | Action | Finance role | Sales role |
  |---|---|---|
  | View finance | 200 | 403 |
  | Set the monthly target | 200 | 403 |
  | Edit a customer without an order | 200 | 403 |
  | Delete a customer | 403 | 403 |
  | Manage staff | 403 | 403 |

- **Rollback** to the version live before this release (`1a9051ad`, deployed 08:54:37 UTC on 2026-11-03):
  `npx wrangler rollback 1a9051ad-cddd-4d30-944b-eb1ba07fd787 --config wrangler.deploy.jsonc`.
  There is no schema or data change, so a rollback only returns those users to their individual permissions. Edits
  they already saved stay.

## Released: finance edits the customer file (2026-11-03, at the user's request)

- `design/phase-0-shell` fast-forwarded into `main` (`81b5e9f` → `e8fcfc4`) and pushed. The branch push went live as
  version `14abce57-256c-4185-b356-d8dd5e4eaf34` at 08:51:32 UTC, about 90 seconds later. Nobody ran `wrangler deploy`.
- Carries four commits:
  - `93e4455`: shares as donuts with percentages.
  - `24221e4`: home numbers counted on Riyadh days, with where each comes from.
  - `546a777`: weekly challenges run Saturday to Friday from the first of the month.
  - `e8fcfc4`: finance edits customer data, source and cohort from its file. See "Finance can edit the customer's
    data (2026-11-03)".
- Checked on the live site without signing in: home 200, the new CSS served, `/api/finance` and `/api/customers` 401.
  The signed-in screens were tested on synthetic local data only, not on the live site.
- **Rollback** to the version live before this release (`6f87353c`, deployed 16:49:11 UTC on 2026-11-02):
  `npx wrangler rollback 6f87353c-037e-43b2-baf3-839534c1d860 --config wrangler.deploy.jsonc`.
  There is no schema change. A rollback removes the screens only: edits finance already saved stay in the data.

## Released: Phase 5 B2B and the payment-default pause (2026-10-30, at the user's request)

- `design/phase-0-shell` fast-forwarded into `main` (`fd0945d` → this commit) and pushed. It deploys
  automatically.
- Carries three commits:
  - `b86a4d5`: the B2B main screens on the design system.
  - `93eeb8c`: the payment-default pause. An order with an instalment under «تطبيق السياسة» leaves the
    collection forecast and shows as a separate paused amount. Its file has no reminder buttons, and its
    payment behaviour reads «تطبيق السياسة». The finance API's `forecast` gains `paused` and
    `paused_installments`. No data or schema change.
  - `88dda16`: the partner file on the customer-file layout.
  See [PHASE-5-B2B.md](PHASE-5-B2B.md) and [FINANCE-AUDIT.md](FINANCE-AUDIT.md).
- **Rollback** to the customer-phone release (version `5baafa0d`, deployed 16:42:56 UTC on 2026-10-29):
  `npx wrangler rollback 5baafa0d-3d64-40e9-a0ac-491e86bb3680 --config wrangler.deploy.jsonc`.
  This release writes no new data, so a rollback restores everything. Orders under policy then appear in the
  forecast again.

## Released: customer phone on finance rows (2026-10-29, at the user's request)

- Finance staff asked to see the customer's phone in the list. It now shows under the name in both finance
  tables. Display only; the finance API already returned it.
- **Rollback** to the finance file release (version `5f9abee5`, deployed 19:53:19 UTC on 2026-10-28):
  `npx wrangler rollback 5f9abee5-d046-4884-8e0c-634b1531b97a --config wrangler.deploy.jsonc`.
- Next: Phase 5 (B2B) started right after this release.

## Released: finance file layout (2026-10-29 evening, at the user's request)

- `design/phase-0-shell` fast-forwarded into `main` (`1340147` → this commit) and pushed, so it deploys
  automatically.
- Carries:
  - the finance file laid out like the customer file (sticky header, review action first, balance block,
    ledgers);
  - the restyled seat-transfer requests card.
  No calculation or API change. All controls are the same.
- **Rollback** to the finance release verified the same evening (version `8fb3097f`, deployed 19:41:35 UTC):
  `npx wrangler rollback 8fb3097f-4a00-474f-9296-bb47e18cc0fb --config wrangler.deploy.jsonc`.
  No data is involved.

## Released: Phase 4 Finance and the finance fixes (2026-10-29, at the user's request)

- `design/phase-0-shell` fast-forwarded into `main` (`2c28633` → this commit) and pushed. The push deploys
  automatically (see "Released again" below).
- Carries three commits:
  - Phase 4 Finance, with before/after-VAT amounts ([PHASE-4-FINANCE.md](PHASE-4-FINANCE.md));
  - the finance calculations audit;
  - its fixes ([FINANCE-AUDIT.md](FINANCE-AUDIT.md)).
- **Behaviour the team will notice:**
  - Sales and collections on the finance page now count confirmed payments only, net of refunds, like the home
    dashboard. Figures that included money still under review will drop.
  - That money now shows on its own in «بانتظار المراجعة».
  - Seat fees from the registration form appear in finance and in the customer file.
  - Cancelled installments of withdrawn customers no longer count as late.
- No `drizzle/` migrations and no schema change.
- **Rollback** to the release the user verified on 2026-10-28 (version `f1a736e2`, deployed 18:26:52 UTC):
  `npx wrangler rollback f1a736e2-d993-423e-a4ce-c13a32e2d0ce --config wrangler.deploy.jsonc`.
  Data is unaffected either way. The only stored change is that instalment payments recorded after this release
  carry the date as `YYYY-MM-DDT12:00:00.000Z`, which the old code reads the same way.

## Where we stopped (end of day 2026-10-28, office machine)

- Branch `design/phase-0-shell` is pushed and **2+ commits ahead of `main`**. *(Corrected in the evening: it was
  already live through the automatic branch deploys. See "Released again" above.)*
- The live site runs `main` at `ad619fa` (Cloudflare version `3b8dcd9e…`), verified by the user. *(Outdated, see
  above.)*
- Latest work: the registration form review, fixes and redesign ([REGISTRATION.md](REGISTRATION.md)), plus a **data map**
  of the registration flow: [registration-map.html](registration-map.html) (also published privately for the user at
  https://claude.ai/artifact/33mcKRBWyQhzYXUsmkFSaL).
- **Update (2026-10-28 evening, home machine):** the user chose Priority 1–2. Done and now released: existing-customer alert, seller in `orders.owner`, store order number for سلة/عصارة, seat-fee suggestion.
  See "Data-entry improvements" in [REGISTRATION.md](REGISTRATION.md). These change the intake API (new
  `POST /api/intake/lookup`, `orders.owner` value), which the user approved by choosing this option.
- **Price list and VAT (decided 2026-10-28):** list prices per programme/track/delivery (VAT included) fill the
  base amount; amounts show before/after VAT. Discount approval levels are internal and not enforced. See
  "Price list and VAT" in [REGISTRATION.md](REGISTRATION.md). The pricing spreadsheet in the repo root holds
  customer names and salaries: never commit it.
- **Supervision (decided 2026-10-28):** no cohort and no dates. It only asks "seat reserved?", with a fixed fee of
  50 SAR, and goes straight to onboarding.
- **Assignment date (decided 2026-10-28):** every scheduled live programme (live without a seat, seat with
  registration, seat only) now waits until its assignment date, then moves into onboarding automatically.
  This reverses the 6 September behaviour, where reservations went to onboarding at once. See "Assignment date" in
  [REGISTRATION.md](REGISTRATION.md).
- **Still waiting on the user:**
  - The remaining map suggestions: errors under each field, phone formatting, remember last source/method.

## To continue at home

1. If the repo isn't on that machine yet: `git clone https://github.com/Wida3tk/Oper.git` then
   `git switch design/phase-0-shell`. If it is: `git fetch` then `git switch design/phase-0-shell` and `git pull`.
2. Open the project in Claude and say: «اقرأ docs/dashboard-redesign/HANDOFF.md وكمّل».
3. For tests and local checks you need Node.js ≥ 22.13 and Git (this office machine got both through winget).

## Finance can edit the customer's data (2026-11-03)

- Financial data was already editable from the finance file (discount, seat fee, first payment, schedule, installment and payment dates, reference, withdrawal, undo), each under its own `finance.*` permission.
- New: anyone with the `finance` role edits **name, phone, email, purchase source and cohort** there, with the change in "سجل تعديل البيانات". `PATCH /api/customers` takes `orderId`: source and cohort go to that order (it must belong to the customer) instead of the latest order, and `customers.admitted_via` stays as it is. Editing the source changes the order's label only: `payments.method` and finance review stay as they were.
- The route now answers 409 when the phone or email belongs to another customer (it was a unique-index 500), and accepts `+966…`.
- Local QA note: `GET /api/finance` fails on a fresh database until one POST with an `orderId` creates `finance_undo_log`.

## Next steps (agreed with the user, 2026-10-28)

The user said to continue in whatever order works best and to push each batch to `design/phase-0-shell` as it's done.
Merge to `main`, deploy or open a PR only when the user asks. **While branch pushes auto-deploy (see "Released
again"), a push is a release: ask before pushing.**
1. ~~Finance UTC dates~~ **Done:** every "today" default in `app/page.tsx` (11 spots: the intake purchase date, finance today/month/forms, B2B activity date and follow-ups, the export filename) now uses the local date. A test guards it.
2. Phase 3 remainder: "تسليم العميل" (`TrialHandoff` + `Registration` under view `contact`). **Done** (trial box and stuck "جديد" column): see [REVIEW-CONTACT.md](REVIEW-CONTACT.md). The `Registration` intake form was then reviewed, fixed and redesigned, with an end-to-end save checked: see [REGISTRATION.md](REGISTRATION.md). Released on 2026-10-28 (see "Released again").
3. Phase 4 (Finance): **done on the branch, committed, not pushed** (a push releases it). Includes before/after-VAT
   amounts. See [PHASE-4-FINANCE.md](PHASE-4-FINANCE.md). Then 5 (B2B), 6 (Programs/Users/Control/Reports), 7 (clean-up). Clean-up includes the unused `LegacyLiveWork`, `Customers`, `CustomerTable` and the `Dashboard` demo components.
4. Open user decision: Phase 1 suggestion #8, one window for upcoming items (schedule 30 days vs. team events 90).

Local QA recipe that worked on the second machine: a copy of the repo in `%TEMP%oper-preview` (no node_modules), `CI=true npx pnpm@10 install --frozen-lockfile`,
`compatibility_date` set to 2026-05-22, start `npx vinext dev --port 3011`, POST `/api/auth` once to create the D1 file, stop, apply `drizzle/*.sql`
with node:sqlite, run `dev/seed-synthetic.mjs`, restart. Some routes read runtime columns (`orders.order_number`). Call `/api/enrollments` once first.
`GET /api/finance` returns 500 on a fresh local database until one `POST /api/finance` (any `orderId`, any action) has created
`finance_undo_log`; production already has it.
- `main` locally had 28 commits not on `origin/main` at handoff time. They reach GitHub only as history of
  this branch. `origin/main` was not touched.

Read first: [README.md](README.md) (what changed, preservation checks, phase plan) and
[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) (tokens, patterns, rules).

## Ground rules agreed with the user

- Keep API contracts, permissions, database schema and business logic unchanged.
- Do not modify SulukeraAcd or any student-facing system.
- Synthetic data only. Do not deploy, merge, push to `main`, or touch production data.
- No fake functionality or invented statistics: every figure maps to a field the API already returns.
- Preserve unrelated work. One phase per PR, and stop for review after each.
- Brand comes from the running product (`#315efb`, `#111d36`, IBM Plex Sans Arabic), not from
  `design-system/sulukera-b2b/MASTER.md`.

## Checks to keep green

| Check | Baseline on this branch |
|---|---|
| `npm test` | 80 / 80 (95 / 95 on `design/phase-0-shell`) |
| `npx eslint app/page.tsx` | 30 errors, 32 warnings (all pre-existing) |
| `npx tsc --noEmit` errors in `page.tsx` | 20 (pre-existing) |

Tests are regex assertions over source in `tests/rendered-html.test.mjs`. Class names they look for
(e.g. `finance-review-breakdown`) must survive a redesign.

## Running it locally with synthetic data

`npm run dev` does not start as-is on the Windows machine used so far:

1. The installed workerd/Miniflare (4.20260515) rejects `compatibility_date: "2026-07-22"` in
   `wrangler.jsonc`.
2. `.wrangler/deploy/config.json` redirects dev to the deploy config.
3. D1 state written by a newer wrangler CLI crashed the older Miniflare.

What worked: a throwaway copy of the repo outside the checkout (e.g. `%TEMP%\oper-preview`) so nothing in the
repo changes. In the copy only:

- set `compatibility_date` to `2026-05-22`;
- delete `.wrangler/` (both deploy and state);
- `npx pnpm@10 install --frozen-lockfile`;
- `npx vinext dev --port 3011`, then open the page once so the app creates its tables;
  (on the second machine this created only an empty D1 file. Hit `/api/auth` once, stop the server, then
  run every `drizzle/*.sql` file in order against that `.sqlite` with `node:sqlite`, splitting on
  `--> statement-breakpoint`. With pnpm in a non-TTY shell, set `CI=true` for the install.)
- stop the server and seed:
  `node docs/dashboard-redesign/dev/seed-synthetic.mjs <copy>/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/<file>.sqlite`;
- start it again and set the cookie `sulukera_session=<token printed by the seed>` on `localhost:3011`.

The seed writes 46 invented customers (`@example.test`), 4 `.test` staff (admin / sales / finance /
academy), payments, targets, tasks and activity for October 2026. It refuses any path outside
`.wrangler/state`, and makes a new session token each run.

Screenshots: `node docs/dashboard-redesign/dev/screenshots.mjs <outDir> <prefix> <token>` (headless Edge,
1440px desktop + 390px mobile, full page).

Watch disk space: the first machine's C: drive ran out mid-session, which surfaced as `SQLITE_FULL` and
paging-file errors. The copy needs about 1 GB. Delete it when you are done.

## Known limits carried forward

- "Today" in the dashboard's daily totals uses the existing UTC logic, which is off between midnight and
  03:00 Riyadh time. That's existing behaviour, left on purpose.
- Only the academy role was clicked through for the no-finance view. The full role matrix is part of each
  phase's acceptance.
- Not checked on a real phone or in Safari.
