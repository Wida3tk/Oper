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
  the suggestions waiting for the user's decision. Do not start Phase 2 until they say so.
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
| `npm test` | 80 / 80 (82 / 82 on `design/phase-0-shell` after Phase 1) |
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
