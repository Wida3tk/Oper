# Finance calculations audit (2026-10-28)

Asked by the user after Phase 4: "are the finance numbers correct?". Phase 4 changed how figures are displayed, not
how they are calculated. This audit checks the calculations themselves. All findings below were there before
Phase 4. **Nothing in the money logic has been changed yet**; the fixes wait for the user's decisions.

## Method

1. Read the calculation code: `GET /api/finance` (`app/api/finance/route.ts`) and the page formulas in
   `LiveFinance` (`app/page.tsx`).
2. Created realistic cases through the real APIs on synthetic data:
   - a supervision subscription paid by Tamara;
   - a live ABA registration with a 300 seat fee, paid through سلة;
   - a seat-only reservation;
   - an instalment order (review approved, 3-instalment schedule, one instalment paid);
   - a withdrawal with a 500 refund on an order whose first instalment was overdue.
3. Recalculated every figure from the raw tables (`orders`, `payments`, `installments`, `withdrawals`,
   `seat_reservations`) with a separate script, and compared it with the API, the page's formulas and the numbers
   rendered on screen. The script is `finance-audit.mjs` in the session scratchpad.

## Correct

| Check | Result |
|---|---|
| Paid and remaining per order (50 orders): payments − refund, remaining = 0 after withdrawal | 0 mismatches |
| Total remaining (125,390.00) | matches |
| Collections total and this month (by `flow_type = collection`) | match |
| Orders waiting for finance review (7) | matches |
| Before-VAT amounts (÷ 1.15, rounded to the halala): 15,525 → 13,500; 1,200 → 1,043.48 | correct |
| Numbers on screen = the page's formulas (123,385 / 114,565 / 3,155 / 125,390) | match |

## Problems found

| # | Severity | Problem | Evidence | Cause |
|---|---|---|---|---|
| 1 | High | **"Sales" means different things on the home page and the finance page.** Finance counts every recorded payment, including those still waiting for review, and does not subtract refunds. The home dashboard counts confirmed payments only, net of refunds | October sales: home **72,815**, finance **114,565**. Collections: 1,955 vs 3,155 | Finance sums `payments` without `classification_status = 'confirmed'` and without `withdrawals.refund_amount` |
| 2 | High | **Payments counted as sales that are not sales**: a supervision payment (recorded as a collection) is counted in sales *and* collections, and a seat-only fee is counted as a sale | +1,500 in sales (1,200 supervision counted twice, 300 seat fee) | The sales list falls back to "the first payment of any type" when an order has no `sale` payment |
| 3 | High | **Seat fees from the current registration form never show in finance or the customer file.** For a seat with registration, the fee is also never recorded as a payment, so it appears in no total | 2 of 2 seat fees (300 each) shown as 0 | Finance and customers read the fee only for kinds «حجز مقعد»/«إشراف». Registration has written «حجز مع تسجيل»/«حجز مقعد فقط» since 9 August. Intake stores the fee only in `seat_reservations` |
| 4 | Medium | **Cancelled instalments of a withdrawn customer still count as late** and show «متأخر» | Late instalments: should be 2, shown 3 | `display_status` marks any unpaid past-due instalment as late, including «ملغي» |
| 5 | Risk | **The finance API loads only the latest 200 orders.** Every total on the page covers only those | Not visible on synthetic data (50 orders) | `LIMIT 200` in the orders query |
| 6 | Low | **Dates near midnight.** Instalment payments are stored as a UTC timestamp, so a payment recorded 00:00–03:00 Riyadh lands on the previous day (or month). The API's "late" uses the UTC date. The page's "today" uses the device's time zone: this machine is UTC+5, so for 2 hours each evening its "today" is already tomorrow | A payment recorded at 22:23 Riyadh is stored as 19:23Z; the device here showed today = 29 Oct while Riyadh was 28 Oct | `new Date().toISOString()` for `paid_at`; device-local dates on the page |

## Fixed (same day, approved by the user)

The user approved fixing #2, #3a, #4 and #6. For #1, finance uses confirmed sales net of refunds, like the home
dashboard, with the amount under review shown on its own.

| # | Fix |
|---|---|
| 1 | Sales and collections on the finance page are **confirmed payments of that flow, by payment day, minus completed refunds charged to it, by withdrawal day**. This is the home dashboard's rule, summed in halalas. Applied to collections too, since the same gap existed there. The «بانتظار المراجعة» metric shows the count **and the amount under review**, which stays out of every total until approved |
| 2 | Metrics no longer add up the sales list. The list still shows every operation that needs review, so supervision reviews opened from the home page keep working. Its "operation" column now says what each payment is: «تحصيل إشراف», «رسوم مقعد», «دفعة أولى» or «دفع كامل». A seat-only row no longer shows its fee twice |
| 3a | Finance and customer APIs read seat fees from all reservation kinds. Seat-fee payments no longer count towards the programme's paid amount, so «إجمالي المدفوع فعلياً» doesn't double them. The legacy seat-fee tool (built to move a fee out of an old contract total) is disabled in the file for registration fees and refused on the server (409), because it would have subtracted a fee that was never in the total |
| 4 | Cancelled installments are never late, and they're left out of payment behaviour |
| 6 | The API's "today" is the Riyadh day. Instalment payments and an added first payment store the date as `YYYY-MM-DDT12:00:00.000Z` (the form the date-edit actions already use). The finance page's "today" and default month use `Asia/Riyadh`, whatever the device's time zone |

**Re-audit** on fresh synthetic data with the same scenarios: 17 / 17 checks match the independent recalculation.
- API: per-order paid and remaining, total remaining, seat fees 2 of 2, late installments 2 (was 3), no cancelled
  installment shown as late, payment date stored as the Riyadh day, legacy tool refused (409).
- Home dashboard: October sales 72,815 and collections 1,955, both equal to the finance page.
- Screen: sales today 25,275, month 72,815, total 81,635; under review 40,950 shown apart; collections 1,955;
  remaining 125,390.

Still open: #3b (record a seat fee paid with registration as its own payment), #5 (the 200-order cap; needs the
production order count). Not changed: the registration form's default purchase date still uses the device's date.

## Proposed fixes (original list)

- **Clear bugs, read-side only:** #2 (sales = `flow_type = 'sale'` only; keep the fallback only for old payments
  with no type), #3a (read all seat-reservation kinds), #4 (cancelled instalments are never late), #6 (Riyadh dates).
- **Needs a decision:**
  - #1: which definition of sales should finance use? The proposal is confirmed payments net of refunds, like the
    home page, with the amount still under review shown separately.
  - #3b: should a seat fee paid with registration be recorded as its own payment (`flow_type = 'seat_fee'`)?
  - #5: how many orders does production have? If more than 200, compute the totals in SQL over all orders.
