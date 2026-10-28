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

## Next steps (agreed with the user, 2026-10-28)

The user said to continue in whatever order works best and to push each batch to `design/phase-0-shell` as it's done.
Merge to `main`, deploy or open a PR only when the user asks.
1. ~~Finance UTC dates~~ **Done:** every "today" default in `app/page.tsx` (11 spots: the intake purchase date, finance today/month/forms, B2B activity date and follow-ups, the export filename) now uses the local date. A test guards it.
2. Phase 3 remainder: "تسليم العميل" (`TrialHandoff` + `Registration` under view `contact`). **Done** (trial box and stuck "جديد" column): see [REVIEW-CONTACT.md](REVIEW-CONTACT.md). Still to review: the `Registration` intake form (high-risk: it creates customers, orders and payments).
3. Phase 4 (Finance), 5 (B2B), 6 (Programs/Users/Control/Reports), 7 (clean-up). Clean-up includes the unused `LegacyLiveWork`, `Customers`, `CustomerTable` and the `Dashboard` demo components.
4. Open user decision: Phase 1 suggestion #8, one window for upcoming items (schedule 30 days vs. team events 90).

Local QA recipe that worked on the second machine: a copy of the repo in `%TEMP%oper-preview` (no node_modules), `CI=true npx pnpm@10 install --frozen-lockfile`,
`compatibility_date` set to 2026-05-22, start `npx vinext dev --port 3011`, POST `/api/auth` once to create the D1 file, stop, apply `drizzle/*.sql`
with node:sqlite, run `dev/seed-synthetic.mjs`, restart. Some routes read runtime columns (`orders.order_number`). Call `/api/enrollments` once first.
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
| `npm test` | 80 / 80 (90 / 90 on `design/phase-0-shell`) |
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
