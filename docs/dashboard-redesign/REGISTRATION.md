# New-customer registration (`Registration`)

The form behind "تسجيل عميل" (view `new`) and the bottom of "تسجيل العميل" (view `contact`). It creates the
customer, order, payment and enrollment in one `POST /api/intake`, so it's the riskiest screen in the app.
The user asked for a review plus a more professional, creative design. All work is on branch `design/phase-0-shell`.

## Rule kept

Every field, option, condition and validation message stays as it was, and so does the intake payload. Tests pin
many of them (`<option>اشتراك</option>`, `نمط البرنامج`, `isObm && !isSupervision && <Field label="اللغة *">`…).
The only behaviour change in validation is the future purchase date below.

## Fixes

| # | Problem | Fix |
|---|---|---|
| 1 | "تسجيل عميل آخر" kept the previous customer's data and reopened the review step. Saving again would try to register the same person (the API's 10-minute duplicate guard is the only stop) | Start over for real: blank form (first programme reselected), step 1, no proof file, new submission key. |
| 2 | The purchase date ("تاريخ دفع العميل الفعلي") accepted future dates | `max` on the input, plus a check at the payment step and on save. |
| 3 | The payment box and the review showed the same figure twice ("سعر البرنامج بعد الخصم" and "إجمالي البرنامج", always equal) | Shown once. The payment box adds "المبلغ المسجَّل الآن" / "الدفعة الأولى المسجَّلة الآن" (the amount actually sent). |
| 4 | Source tiles weren't marked as buttons for assistive tech | `type="button"` and `aria-pressed`. |

## Design

- **Progress bar:** four numbered steps (done = green check, current = blue) with a green-to-blue fill.
  Steps stay clickable as before.
- **Live summary card** beside the form (below it on smaller screens): customer, programme · track, subscription,
  mode, cohort, source, and a **receipt** with notched edges: base price, discount, programme price, seat fee,
  and what is recorded now. For instalments it shows the remainder. It also shows a finance-route chip ("مكتمل
  مالياً عبر سلة" / "تنتقل للمالية للمراجعة"). Every value comes from the form state.
- **Form card:** step badge, 44px inputs with focus ring, source tiles with a selected check, a dashed drop zone
  for the bank-transfer proof (green when attached), and an info note for scheduled programmes.
- **Review step:** order summary as a ledger, and "الإجراءات التي ستُنشأ" as a vertical timeline (done / next / finance).
- **Success card:** a check mark that pops in once (off with reduced motion), a summary of what was saved, and
  the two next actions.
- Removed 42 CSS rules from the old stepper, layout and success screen. The new styles are scoped to
  `.rg-shell` / `.rg-done`, so other forms using `.field` / `.form-head` are unaffected.

## End-to-end check (local copy, synthetic data, headless Edge)

| Check | Result |
|---|---|
| Fill steps 1–3 (ABA · ABAT, سلة, 5,000 with 10% off), future purchase date | Refused: "تاريخ الشراء هو تاريخ دفع العميل الفعلي، ولا يمكن أن يكون في المستقبل" ✅ |
| Live receipt | 5,000 − 500 = 4,500, "يُسجَّل الآن 4,500" ✅ |
| Save | Order ABA base 5,000, discount 10%, total 4,500, paid 4,500, "مدفوع"; payment 4,500 `sale` / `confirmed` on today's date; enrollment "تم التواصل" ✅ |
| Same phone again within 10 minutes | Refused by the API's duplicate guard (expected) ✅ |
| "تسجيل عميل آخر" | Back to step 1 with an empty form ✅ |
| No horizontal scroll and no text under 12px at 1440 and 375px, every step | ✅ |

Screenshots: `screenshots/phase-3/register-*.png`. Tests: 91 / 91 (one new test). Lint and type-check are no
worse: lint is one error lower than before Phase 3.

## Not changed, worth a later look

- The steps can still be clicked in any order. The final save re-checks everything, so nothing invalid reaches
  the API, but errors only show on "التالي" or on save.
- The discount options (0–50% in steps of 5) and the "تمارا" option, which appears both as a payment plan and as
  a direct payment method, are product decisions.

## Data-entry improvements (Priority 1–2 from the registration map)

Chosen by the user on 2026-10-28. Unlike the redesign above, these change the intake API on purpose.

| # | Problem (from the map) | Change |
|---|---|---|
| 1 | An existing customer was matched silently by phone or email. The typed name, phone and email were dropped without a word | **Existing-customer alert** in step 1 and on the review step, 400 ms after a valid phone or email. It names the file the order will join and lists what won't be saved (name, phone, email differences). It turns red when the file is **deleted** or when phone and email match **two different files**, and says which one gets the order. New `POST /api/intake/lookup` (sales only, phone and email in the body, not the URL). Intake and the lookup share `findExistingCustomers()`, so the alert always names the same file the save uses. |
| 2 | Every order saved the owner as «غير مسند» | `orders.owner` = the signed-in staff email. `GET /api/customers` returns the staff display name when there is one. The customer file shows **«سجّل الطلب»**, and older orders read «غير مسجَّل». |
| 3 | No reference for سلة / عصارة orders | Optional **«رقم الطلب في المتجر»** for those two sources, saved in `payments.reference` (the API already stored the reference for every source). Cleared when the source changes, shown in the review. The API now refuses references over 300 characters. |
| 4 | `programs.seat_reservation_fee` was never used | Choosing «تم حجز المقعد: نعم» fills the fee from the programme when it is set and the field is empty. It stays editable, and the help text says where the number came from. Supervision stays fixed at 50. |

Not done here: updating the existing file's phone or email from the alert. It points to the customer file, where
`customers.manage` users can already edit them. The trial-conversion route (`/api/trials`) still writes «غير مسند».

### Checks (local copy, synthetic data)

| Check | Result |
|---|---|
| Lookup without a session | 401 ✅ |
| Lookup by email, any case or spaces | Finds the file ✅ |
| Phone of one file + email of another | Both returned. The save then joins the one the alert names first ✅ |
| New customer via سلة with store number | `orders.owner` = staff email, `payments.reference` saved ✅ |
| Existing customer, different name and phone | Order joins the file. The file's name and phone are unchanged, as the alert says ✅ |
| Reference of 301 characters | 400 ✅ |
| Customers list | Seller's display name for the new order, «غير مسند» for old ones ✅ |
| Form: alert, seat fee 300 pre-filled, store field per source, review rows, full save, «سجّل الطلب» in the customer file | ✅ |
| 375px | Alert wraps, no horizontal scroll, text ≥ 13px ✅ |

Tests: 92 / 92 (one new). Lint on the touched files is unchanged (60 problems, all pre-existing). Type errors are
unchanged (101 project-wide, all from the missing Cloudflare types).

The synthetic seed now stores phones as `00966…`, as real records are. Before, seeded phones couldn't be found by
phone lookup.

## Assignment date (decided 2026-10-28)

**Problem (from the map):** the form required an assignment date and promised the customer would "move
automatically on the assignment date". Since 6 September (`9260c21`) nothing waited, though: every reservation was
promoted to onboarding on the next page load, and a live programme without a seat stored no date at all.

**Decision:** every scheduled live programme waits for its assignment date. That covers live without a seat, seat
with registration, and seat only. Supervision is not scheduled (see below). While waiting, the customer shows in
the Operations Center "القادم" list and in their file.

| Where | Change |
|---|---|
| `POST /api/intake` | If the journey is scheduled and the assignment date is **after today (Riyadh)**, no enrollment or onboarding task yet. A `seat_reservations` row holds the dates: `reservation_kind` «برنامج مباشر» when there is no seat, status «بانتظار الإسناد» («حجز فقط» for seat only). The order's `academy_status` is «بانتظار الإسناد». Today or earlier: unchanged, straight to onboarding. عصارة without a seat: unchanged (auto-complete). |
| `promoteDueReservations()` | Back to waiting for the date: `date(assignment_date) <= date('now','+3 hours')`. Rows with no date still move at once. It also skips «ملغي», so reservations of deleted customers never come back. It runs when the Operations Center, onboarding, dashboard "today" or reservations API is loaded. |
| Finance withdrawal | Also withdraws the order's waiting reservation, so it is never promoted. |
| Operations Center | The upcoming list also shows «حجز فقط» reservations (30-day window, as before). |
| `GET /api/customers` + customer file | Waiting files read «بانتظار الإسناد · ينتقل إلى التهيئة تلقائياً في <date>». |
| Form | The hint and the review timeline now say whether the move happens on a future date or immediately. |

### Checks (local copy, synthetic data)

16 / 16 API scenarios passed:
- Live without a seat waits, shows in the upcoming list and the customer file, then on its date gets one
  enrollment and one onboarding task, with no second promotion.
- A date of today goes straight to onboarding.
- Seat with registration waits and keeps its 300 fee.
- Seat only waits, is listed, and moves on its date.
- عصارة without a seat still auto-completes.
- A withdrawal before the date means it is never promoted. So does a deletion before the date.

In the browser, the customer file text and the review step were checked for both a future and a past date. Tests:
93 / 93. Lint and type errors are unchanged.

**Limits:**
- The move happens the first time someone opens one of the pages above on or after the date. There is no
  scheduled job.
- The upcoming list only shows the next 30 days.
- A waiting row without a seat is stored as «برنامج مباشر». The kinds «حجز مقعد»/«إشراف» are avoided on purpose:
  the legacy seat-fee action marks those «تم التحويل», which would stop the promotion.

## Supervision: seat only, no cohort (decided 2026-10-28)

The user: supervision has no cohort. It only asks "seat reserved?" yes/no, with a fixed fee of 50 SAR.

- **Form:** supervision shows only the programme and «هل تم حجز المقعد؟». With «نعم», the fee shows 50 and can't
  be edited. Cohort, start date, assignment date and the booking type are hidden. The review timeline says
  onboarding starts straight away. Hidden cohort and dates are no longer sent for any journey they don't apply to.
- **API:** for supervision, intake ignores cohort, start and assignment dates, forces the booking type to «حجز مع
  تسجيل» (no seat-only supervision), keeps the 50 fee, and creates the enrollment and onboarding task at once.
  `isScheduled` is defined once, and it excludes supervision (`isDirectProgram` counts supervision as direct).
- **Customer file:** no «رقم الدفعة» row for supervision.
- The review timeline now uses the API's own rule for عصارة auto-completion. Before, it showed "auto-activated via
  عصارة" for supervision and competency assessment too, which the API never did.

Checks: 18 / 18 API scenarios on synthetic data:
- Supervision without a seat goes straight to onboarding, with no cohort or dates stored, even when they are sent.
- Supervision with a seat and «حجز مقعد فقط» + a fee of 999 sent: stored as 50, with registration, straight to
  onboarding.
- Live ABA still requires a cohort.
- All the earlier assignment-date scenarios still pass.

The form was checked in the browser. Tests: 94 / 94.
