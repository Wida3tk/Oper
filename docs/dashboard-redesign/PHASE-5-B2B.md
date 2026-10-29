# Phase 5: B2B (part 1: main screens)

Branch: `design/phase-0-shell`. Scope: `B2BWorkspace` in `app/page.tsx` (the «الشراكات» and «مبيعات الأعمال» views)
and its CSS. Same API, same permissions, same actions.

## Screenshots

| | Before | After |
|---|---|---|
| Partnerships, 1440px | ![](screenshots/phase-5/before-partnerships-1440.png) | ![](screenshots/phase-5/after-partnerships-1440.png) |
| Business sales, 1440px | ![](screenshots/phase-5/before-business-1440.png) | ![](screenshots/phase-5/after-business-1440.png) |
| Partner file, 1440px | ![](screenshots/phase-5/before-file-1440.png) | ![](screenshots/phase-5/after-file-1440.png) |
| Partnerships, 375px | ![](screenshots/phase-5/before-partnerships-375.png) | ![](screenshots/phase-5/after-partnerships-375.png) |

Synthetic data only. 10 partners across every lifecycle stage and 7 business opportunities were created through
the API. Stages beyond the first were set in the local database, because moving there needs approvals and a
signed agreement.

## What changed

| Before | After | Why |
|---|---|---|
| Dark navy hero card | **Masthead**: scope, title, one line and «إضافة جهة» | Same information, much less height, matching the other pages. |
| 5 separate KPI cards at 8px | **Metric ribbon** with the same five figures and notes. The overdue count turns red when it isn't 0 | Same formulas. |
| Team activity as a grid of boxes at 7–9px | **Feed** in two columns: initials, name, action and organisation, time | Reads in order. |
| Funnel as plain bars | **Funnel steps** with count, bar and percentage. The selected stage is marked (`aria-pressed`) | Clicking a step filters the list, as before. Now you can see which one is active. |
| Toolbar of unlabelled selects | One **filter row**: search plus labelled selects (type, path, stage), and a result line «x من y جهة» with «مسح التصفية» | The same filters. |
| Board and rows at 7–11px | Same board (drag, per-column priority and status filters, reorder buttons) and rows (inline stage, approve/reject), on tokens with a 12px minimum. Card dates are label/value rows, because at 12px the old three-column boxes wrapped | No behaviour change. |
| Partner file, add form and business file at 6–11px | **12px minimum** through 127 generated overrides. Each reuses a legacy selector under `.ops-b2b` and changes only `font-size`, so the layout is untouched. The «غير مناسب» button no longer wraps | The file keeps its layout. Rearranging it is part 2. |
| Errors as plain red text | `oh-alert` with `role="alert"` | The server's gate messages (e.g. when a move needs approvals) are clear. |

Removed CSS: 52 rules (64 selectors) for the old hero, KPI cards, toolbar, team grid, funnel and list chrome. 7
rules shared with the form card lost only their dead selectors.

## Checks (local copy, synthetic data)

| Check | Result |
|---|---|
| Business: 7 rows, pending opportunity marked «بانتظار الاعتماد». Type training → 2, path OBM → 3, clear → 7 | ✅ |
| Funnel step «تم الاجتماع» → 1 row, step marked selected, stage filter set | ✅ |
| Search «بنك» → 1 | ✅ |
| Approve a pending opportunity from its row → no longer pending | ✅ |
| Inline stage change → saved | ✅ |
| Partnerships: reorder button moves the card. Dragging to «التفاوض والاتفاقية» reaches the server, which refuses it until fit and manager approvals exist (correct gate). The message shows in the alert | ✅ |
| B2B user (`b2b.view`): business scope «assigned», own pending opportunity visible | ✅ |
| No text under 12px: board, business list, a partner file from each of the 7 stages, the business file and the add form | ✅ |
| 375px: no page-level horizontal scroll (the board scrolls inside its own frame), the file fits | ✅ |
| `npm test` | 100 / 100 (1 new test) |
| Lint / type errors | 59 (was 60) / 101 (unchanged) |

## Part 2: the partner file

| Partner file, 1440px | Operations stage, 1440px | 375px |
|---|---|---|
| ![](screenshots/phase-5/part2-file-1440.png) | ![](screenshots/phase-5/part2-file-operations-1440.png) | ![](screenshots/phase-5/part2-file-375.png) |

Compare with `before-file-1440.png` / `before-file-375.png` above.

| Before | After | Why |
|---|---|---|
| Navy gradient header, a bare «×», kind / name / location as loose text | **Customer-file header** (`cp-head`): close button (labelled), avatar with initials, file kind, name, location (and type for business) | Same header as the customer and finance files. The file is now a labelled dialog (`role="dialog"`, `aria-modal`, `aria-labelledby`). |
| Lifecycle in white on navy. The connector after the last step ran off to the edge | Same stepper on the light header: brand for reached stages, red for «غير مناسب». Each connector joins a step to the previous one | Reads in the page's colours and stops at the last step. |
| Sections as plain white boxes with legacy colours and inputs | Sections as `cp-section` panels (line, radius, light shadow), md titles, muted descriptions, token inputs with a focus ring. The delete zone looks like `cp-danger` | Matches the other files. |
| On a phone the «إرفاق» button was 18px tall and the contact-state badge wrapped | Button 38px, badge on one line | |

Markup changed only in the header. The body's markup and every action (edit, classify, contact path, approvals,
operations, documents, delete) are unchanged. The styles are one block in `globals.css` scoped to
`.ops-b2b .b2b-drawer`. It overrides the legacy rules instead of deleting them, because the body's own `<header>`
elements (meeting minutes, approvals) still use them.

Checked on synthetic data:

- The first partner file in each of the 7 board columns, at 1440 and 375px: stage shown correctly, no text under
  12px, no horizontal scroll in the file or the page.
- The operations-stage file shows the approvals, operation steps, offer details and documents in the new panels.

## Not done

- The B2B synthetic data is created by a scratch script, not the repo seed.
- The legacy navy-header rules are overridden, not deleted. They can go in the Phase 7 clean-up.
