# Home dashboard numbers audit (2026-11-01)

The user asked to make sure every number on the home page is right, and that it's clear where each one comes
from, why, and how.

**Method.** Every number from `GET /api/dashboard/home` was recalculated independently, straight from the local
D1 file (`home-audit.mjs` in the session scratchpad), for October and November 2026.

**Data.** Synthetic only:

- the seeded data;
- the finance scenarios: supervision, seat with registration, seat only, instalments, and a withdrawal with a
  500 refund;
- three edge cases:
  - a separate confirmed seat-fee payment on an October contract;
  - a second registration for an existing customer;
  - a sale paid at 01:00 Riyadh on 1 Nov, stored as `2026-10-31T22:00:00Z`.

## Findings

| # | Number | Problem | Example | Fix |
|---|---|---|---|---|
| 1 | Sales, collections, refunds, daily chart, contract value and orders by month | The month and day were taken from the stored string's UTC date. `POST /api/payments` and older records store the exact UTC moment, so a payment between 00:00 and 03:00 Riyadh counted on the previous day, or the previous month on the 1st. The finance page used the same rule | October 56,790 instead of 55,790; November 17,025 instead of 18,025 | Every date is the Riyadh day of the stored moment: `date(x,'+3 hours')` in the API and `riyadhDayOf()` on the finance page. Correct for date-only, Riyadh-noon (`T12:00Z`) and exact-moment values alike. Finance and home still match: Oct 55,790 / 0, Nov 18,025 / 1,955 |
| 2 | «المتبقي من عقود الشهر» | Seat-fee payments were subtracted from the programme contracts, though they are not part of them (the finance page already excludes them) | Oct 106,210 instead of 106,510 | Payments with `flow_type='seat_fee'` are excluded |
| 3 | Daily cards «مبيعات/تحصيل/إجمالي اليوم» | In any month other than the current one they showed that month's last day with movement, still labelled «اليوم» | October viewed on 1 Nov: «مبيعات اليوم 8,250» was 28 Oct | The label names the day: «مبيعات 28 أكتوبر». «اليوم» only for today |
| 4 | Monthly target ring | Capped at 100%, so 130% read 100%. With no target it read 0% | | The number is the real share, and only the ring's fill is capped. The text shows the net sales behind it: «صافي المبيعات 55,790 ر.س = 31% من الهدف». No target shows «—» |
| 5 | Trainee donut centre | Read «متدرب» but is the sum of the groups, so a customer with two registrations counts twice | 49 shown, 48 people | The centre reads «تسجيل». The subtitle says what counts: registrations not withdrawn, from «جديد» to «نشط», unaffected by the month picker |
| 6 | «أعلى يوم» | Amount without the day | | Shows the day: «أعلى يوم 1 أكتوبر 11K» |

## What each number now says about itself

| Number | Explanation on screen |
|---|---|
| The three customer metrics | Header: current numbers, unaffected by the selected month, deleted files excluded. «عملاء يحتاجون متابعة» says whether it covers the whole team (admin) or only your tasks |
| «عملاء أضيفوا اليوم» | Created today, Riyadh time |
| Net sales | Confirmed first and full payments by payment date, after refunds, excluding seat fees |
| Contract value | Value of n orders created in the month, excluding withdrawn ones; not money received |
| Remaining of the month's contracts | Contracts minus their confirmed payments so far, excluding seat fees. Amounts under review are not subtracted |
| Footnote | Payment date for sales, instalment date for collections, Riyadh time. Refunds are deducted in the withdrawal month. Pending items and seat fees are not included |
| Pending finance review | Orders from all months that don't count until approved |

## Matching after the fixes

All of these match the independent calculation for October and November:

- sales, collections, cash, contract orders and value, remaining;
- review count;
- the daily chart's sum;
- customers today and total customers;
- the trainee centre.

## Weekly challenge (the user's decision, same day)

- **Before.** Weeks ran Saturday to Thursday from the first Saturday of the month. Days before the first
  Saturday, and every Friday, fell in no week.
  - October: 12,800 of 55,790 in sales sat outside every week.
  - November: 1–6 Nov was in no week.
- **Now.** Weeks run **Saturday to Friday**. **Week 1 starts on day 1** and ends on the first Friday, so a month
  has up to 6 weeks (the label «السادس» was added; the target API already accepts week 6).
- **Check.** Over January 2026 to December 2027, every day falls in exactly one week. Every week after the first
  starts on a Saturday, and every week before the last ends on a Friday.
  - November 2026: 1–6, 7–13, 14–20, 21–27, 28–30.
- **Card label.** It names the real weekdays, e.g. «1–6 من الشهر · الأحد–الجمعة».
- **Existing weekly targets.** They are stored by week number, so a target saved before this change now applies
  to the new range of that number. For November, «الأسبوع الأول» was 7–12 and is now 1–6. Check this month's
  weekly targets after the release.

## Not changed

- `POST /api/payments` still stores the exact moment. That is now read correctly, so no data change is needed.
- Finance audit #3b (record the seat fee paid with registration as its own payment) and #5 (the 200-order cap)
  are still open.
