# Workspace UX System

## What It Does

The workspace UX system makes shared dashboard patterns feel consistent across
Library, Stitchr, Clipr, Swapr, Swipr, Hook Lab, onboarding, and asset cards.

It adds:

- A scoped `dashboard-shell` visual system that aligns the authenticated app
  with the Figma-style public pages without making the product UI feel like a
  landing page.
- Grouped Library navigation for Videos, Finished, and Assets.
- Shared segmented controls for tabs, filters, and mode toggles.
- Shared dashboard alerts for error, info, success, and warning messages.
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

The authenticated app uses darker Figma-aligned tokens, compact Barlow
Condensed page titles, DM Sans body copy, restrained purple accents, and
surface-based cards. The sidebar groups the product into Home base, Make, and
Ship so users can quickly get back to the job they were doing.

Media cards use `MediaPrimaryAction` for the clearest next action:

- Clips: Use in Stitchr
- Stitches: Download
- Swipes: Continue editing
- Avatar photos: Use in Swapr
- Templates: Use in Stitchr through the existing template card action

## Maintenance Notes

Prefer these shared components before adding a new dashboard-specific variant.
If a new creation tool needs a preview or status column, use `WorkflowLayout`
and `StickyPreviewColumn`. If a new filter looks like a pill tab bar, use
`SegmentedControl` or `StatusFilterTabs`.

Dashboard copy should use the same human voice as the public pages, but with
product-screen clarity. Prefer `opener clips`, `product demos`, `Stitches`,
`carousel drafts`, `source clips`, `review`, `reuse`, and `post`. Use `UGC` only
when the interface needs the exact asset type or when internal data naming is
being documented.

Keep user-facing blockers direct. Say what to do next, such as "Create or choose
a product before generating text," instead of referring to where the setting
lives in the UI.
