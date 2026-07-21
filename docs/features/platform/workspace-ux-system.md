# Workspace UX System

## What It Does

The workspace UX system makes shared dashboard patterns feel consistent across
Library, Stitchr, Clipr, Swapr, Swipr, Hook Lab, onboarding, and asset cards.

It adds:

- A scoped `dashboard-shell` visual system that carries the landing page's warm
  graphite, copper, grain, typography, and cut-corner geometry into the
  authenticated app without making dense product screens feel like marketing
  pages.
- Grouped Library navigation for Videos, Finished, and Assets.
- Shared segmented controls for tabs, filters, and mode toggles.
- Shared dashboard alerts for error, info, success, and warning messages.
- A shared dialog viewport that preserves the top edge and close control on
  short screens while centering shorter dialogs when space is available.
- Shared workflow layouts for creation screens with a main work area and sticky
  preview/status column.
- A Stitchr step strip that shows Pick clips, Add text, Preview, and Create.
- Visible primary actions on media cards.
- A persistent job tray opened from the active background-work banner.

## Implementation

Reusable UI lives in focused files:

```text
web/app/_components/ui/SegmentedControl.tsx
web/app/_components/ui/StatusFilterTabs.tsx
web/app/_components/ui/PanelHeader.tsx
web/app/_components/ui/Panel.tsx
web/app/_components/dashboard/DashboardShell.tsx
web/app/_components/dashboard/DashboardSidebar.tsx
web/app/_components/dashboard/DashboardAccountButton.tsx
web/app/_components/dashboard/DashboardPageHeader.tsx
web/app/_components/dashboard/DashboardAlert.tsx
web/app/_components/dashboard/BlockedActionMessage.tsx
web/app/_components/dashboard/MediaPrimaryAction.tsx
web/app/_components/workflow/WorkflowLayout.tsx
web/app/_components/workflow/StickyPreviewColumn.tsx
web/app/_components/workflow/WorkflowStepList.tsx
web/app/_components/dashboard/ActiveWorkerJobsTray.tsx
```

Active job labels are shared through:

```text
web/convex/listActiveAutomationBatchJobSummaries.ts
web/lib/clipstitchr/types/ActiveWorkerJob.ts
web/lib/clipstitchr/constants/activeWorkerJobLabels.ts
web/lib/clipstitchr/utils/getActiveWorkerJobLabel.ts
web/lib/clipstitchr/utils/getActiveWorkerJobStatusLabel.ts
```

## Usage Context

`LibraryTabs`, Pexels filters, Stitch status filters, Swipe status filters,
Stitchr mode, and Clipr mode use `SegmentedControl`.

Clipr, Swapr, Stitchr, and Swipr use `WorkflowLayout` so users see a predictable
main work area plus the output, preview, or progress panel.

The authenticated app uses the same warm graphite and tonal copper palette as
the landing page. Arial Black carries the large page names and Arial keeps
controls and supporting copy direct. A quiet grain textures the page substrate,
while one angular background silhouette gives the top of each route a shared
signature without sitting over live content.

The old purple graph grid, pill eyebrows, condensed all-caps page names, icon
tiles, glowing shadows, and rounded-everything treatment are intentionally gone.
Primary actions and the active navigation item use a clipped upper-right corner.
Panels use tonal elevation and a restrained inner top highlight instead of a
floating shadow. Icons stay bare and functional. Segmented controls use compact
tonal states rather than pill chips. Page context and actions sit opposite the
large page name instead of recreating the usual eyebrow-heading-button stack.

The sidebar still groups the product into Home base, Make, and Ship so users can
quickly get back to the job they were doing. On smaller screens it becomes a
drawer. The Clerk account button is client-mounted through
`DashboardAccountButton`, which keeps the signed-in header structure stable
during hydration.

The product and public app shell are dark-only. There is no theme selector,
system preference switch, or light-mode token branch; shared UI should be
checked against the dark root tokens and the scoped `dashboard-shell` tokens.

Dashboard modals use `dashboard-dialog-viewport` from `app/globals.css`. The
viewport owns the backdrop, safe-area padding, vertical overflow, and stacking
level. Its direct dialog child uses automatic vertical margins, which center a
short modal without pushing the top of a tall modal above the screen. Tall
dialogs must also bound their panel to the dynamic viewport and scroll either
the panel or a single `min-h-0` content region. Keep the header and close
control outside an internal scrolling content region when the dialog contains
a long report or list.

The outer `dashboard-shell` owns the dashboard stacking context. Do not add
`isolation`, transforms, filters, containment, or other stacking-context
properties to `dashboard-main`: dialogs are rendered from route content inside
that element and must be able to layer above the sibling mobile header. The
mobile header uses `z-30`, while standard dialog viewports begin at `z-50`.
Trapping a dialog inside a separate main-content stacking context lets the
header cover the dialog title and close control even when the dialog itself has
the higher local z-index.

Media cards use `MediaPrimaryAction` for the clearest next action:

- Clips: Use in Stitchr
- Stitches: Download
- Swipes: Continue editing
- Avatar photos: Use in Swapr
- Hook Lab posts: Open analysis

## Maintenance Notes

Prefer these shared components before adding a new dashboard-specific variant.
If a new creation tool needs a preview or status column, use `WorkflowLayout`
and `StickyPreviewColumn`. If a new filter needs a compact set of choices, use
`SegmentedControl` or `StatusFilterTabs`; do not reintroduce pill-shaped tab
bars.

New dashboard surfaces should inherit the scoped variables in `app/globals.css`
instead of introducing page-local purples, cool slate backgrounds, graph-paper
grids, or broad all-around shadows. Keep controls compact, keep icons out of
decorative boxes, and reserve rounded full shapes for controls where the circle
has a real function, such as a media play button or color swatch.

Dashboard copy should use the same human voice as the public pages, but with
product-screen clarity. Page H1s should be stable names such as `Dashboard`,
`Library`, `Stitchr`, `Clipr`, `Swapr`, `Swipr`, `Hook Lab`, `Schedule`,
`Analytics`, and `Settings`; put human context in the description, empty state,
or blocker copy. Prefer `Hook/UGC clips`, `product demos`, `Stitches`, `carousel
drafts`, `review`, `reuse`, and `post`. Use `UGC` only when the
interface needs the exact asset type or when internal data naming is being
documented.

Keep user-facing blockers direct. Say what to do next, such as "Create or choose
a product before generating text," instead of referring to where the setting
lives in the UI.

## Verification

Check the system at desktop and phone widths on these representative routes:

```text
/dashboard
/dashboard/library
/dashboard/stitchr
/dashboard/settings
```

Then perform a read-only route sweep across Clipr, Swipr, Swapr, Hook Lab,
Schedule, and Analytics. Confirm every route has one visible H1, no hidden
content waiting on an entrance animation, no horizontal page overflow, and no
signed-in hydration warning. Test the mobile navigation drawer with real open
and close clicks. Open representative short and tall dashboard dialogs at
desktop and phone heights. Confirm the top edge and close control are visible
at scroll position zero, the bottom content is reachable, and returning to the
top does not stop before the header. Confirm the sticky mobile dashboard header
is visibly dimmed by the modal backdrop and never covers any part of the dialog.
