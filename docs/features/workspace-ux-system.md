# Workspace UX System

## What It Does

The workspace UX system makes shared dashboard patterns feel consistent across
Library, Stitchr, Clipr, Swapr, Swipr, Hook Lab, onboarding, and asset cards.

It adds:

- Grouped Library navigation for Videos, Finished, and Assets.
- Shared segmented controls for tabs, filters, and mode toggles.
- Shared dashboard alerts for error, info, success, and warning messages.
- Shared workflow layouts for creation screens with a main work area and sticky
  preview/status column.
- Viewport-bounded editor workspaces for creation screens so controls scroll
  inside the tool instead of making the whole page scroll.
- Shared workflow status panels for creation progress, batch status, and output
  state.
- A Stitchr step strip that shows Pick clips, Add text, Preview, and Create.
- Visible primary actions on media cards.
- A persistent job tray opened from the active background-work banner.

## Implementation

Reusable UI lives in focused files:

```text
web/app/_components/ui/SegmentedControl.tsx
web/app/_components/ui/StatusFilterTabs.tsx
web/app/_components/ui/PanelHeader.tsx
web/app/_components/dashboard/DashboardAlert.tsx
web/app/_components/dashboard/BlockedActionMessage.tsx
web/app/_components/dashboard/DashboardShell.tsx
web/app/_components/dashboard/MediaPrimaryAction.tsx
web/app/_components/workflow/WorkflowLayout.tsx
web/app/_components/workflow/WorkflowPageFrame.tsx
web/app/_components/workflow/StickyPreviewColumn.tsx
web/app/_components/workflow/WorkflowStatusPanel.tsx
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
main work area plus the output, preview, or progress panel. Creation routes opt
into the `DashboardShell` workspace variant, and `WorkflowPageFrame` fills that
remaining shell height. `WorkflowLayout` editor mode gives the controls and
preview/status rail their own internal scrolling. On mobile, the editor uses
fixed row tracks so the controls and preview/status areas stay inside the
workspace instead of pushing the dashboard page.

Stitchr normal mode keeps the workflow steps and all clip/text/download controls
inside the left editor rail while the sequence preview stays available on the
right. Stitchr Batch uses the same editor shell with batch generation controls on
the left and batch status on the right.

Swipr Manual keeps photo/text controls on the left and the editable preview on
the right. Swipr Batch keeps pack selection on the left and a batch status rail
on the right.

Media cards use `MediaPrimaryAction` for the clearest next action:

- Clips: Use in Stitchr
- Stitches: Download
- Swipes: Continue editing
- Avatar photos: Use in Swapr
- Templates: Use in Stitchr through the existing template card action

## Maintenance Notes

Prefer these shared components before adding a new dashboard-specific variant.
If a new creation tool needs a preview or status column, use `WorkflowPageFrame`,
`WorkflowLayout`, `StickyPreviewColumn`, and `WorkflowStatusPanel`. Use
`WorkflowLayout` editor mode when the tool should behave like an editor with a
fixed workspace and internal scrolling. If a new filter looks like a pill tab
bar, use `SegmentedControl` or `StatusFilterTabs`.

Keep user-facing blockers direct. Say what to do next, such as "Create or choose
a product before generating text," instead of referring to where the setting
lives in the UI.
