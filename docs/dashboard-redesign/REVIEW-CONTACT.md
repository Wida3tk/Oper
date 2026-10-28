# Review: "تسليم العميل" (view `contact`), not yet changed

Read-only review done on 2026-10-28, from the code. Nothing here is fixed yet. Next step: confirm with the
user, then fix and redesign in the same way as the onboarding page ([PHASE-3-ACADEMY.md](PHASE-3-ACADEMY.md)).

The view renders two components: `TrialHandoff` (trial customers awaiting a decision) and `Registration`
(the new-customer intake form, also used by the "تسجيل عميل" button, view `new`). It doesn't render the
`LiveAcademy` board, even though `LiveAcademy` still supports `focus="contact"`.

## Findings

| # | Kind | Finding | Evidence |
|---|---|---|---|
| 1 | Bug (permissions) | The trial buttons "اشتراك ونقل إلى التهيئة" and "غير مهتم" show to anyone with `customers.manage` (the menu rule). `POST /api/trials` accepts **sales** only (admin always passes). Academy staff, who have `customers.manage`, would get "ليس لديك صلاحية…" | `app/api/trials/route.ts`: `authorize(req,["sales"])`; menu: `["contact","registration"].includes(id) && has("customers.manage")` |
| 2 | Bug (data) | The menu badge for "تسليم العميل" counts enrollments in status `جديد`, but no screen lists them, and no API creates that status any more (intake, trials and reservations all start at `تم التواصل`). Any old `جديد` enrollments are stuck: nothing can run the `contacted` transition on them. The badge points at work that can't be done | `navCounts.contact` in `OperationsApp`; inserts in `api/intake`, `api/trials`, `api/reservations` |
| 3 | Bug (permissions) | Finance is not allowed by `GET /api/trials` (`["sales","academy","viewer"]`). A finance user with `customers.manage` would see the trial box fail to load | same route |
| 4 | Usability | "غير مهتم" closes the trial and reclassifies the customer in one click, with no confirm or undo | `TrialHandoff.decide` |
| 5 | Usability | A failed action shows an error, but a reload replaces the box with "جارٍ تحميل…" each time. The trial box also doesn't refresh on `sulukera:data-changed` | `TrialHandoff.load` |
| 6 | Usability | The trial end date shows no "days left / ended N days ago". Expired trials aren't sorted first | `trialStatus`, card markup |
| 7 | Design | Legacy card markup and CSS (`trial-cards`, `trial-person`…), 8–10px text. The intake form below (`Registration`) is a large legacy form (≈1,100 lines) and needs its own review | — |

## Suggested fixes (for the user to approve)

- #1: show the trial buttons only to `sales` or `admin` (same rule as the API) and make the box read-only for
  others. Or, if academy should decide trials too, allow academy in `POST /api/trials`. That second option is a
  permission change and needs approval.
- #2: either list `جديد` enrollments in a column on this page with the existing "تأكيد تسليم العميل" action
  (`contacted`), or stop counting them in the badge. Check production for any `جديد` rows first.
- #3: hide the trial box for roles the API refuses, instead of showing an error.
- #4–#6: same patterns as onboarding: a 6-second undo before sending, keeping the list on reload, an age chip,
  and expired trials first.
- #7: redesign the trial box on the shared patterns. Review `Registration` separately: it creates customers,
  orders and payments, so any change there is high-risk.
