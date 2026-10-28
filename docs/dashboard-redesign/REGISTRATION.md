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
