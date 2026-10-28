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
