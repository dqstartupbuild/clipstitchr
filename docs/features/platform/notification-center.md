# Notification Center

## What It Does

The dashboard has a global Notification Center opened from the bell icon in the
dashboard header. It shows new and read notifications for content created across
all products and tools.

Users see a red count on the bell when unread notifications exist. Opening the
bell shows a small inbox with each notification title and preview, plus actions
to mark everything read or clear everything. Opening one message marks it read
and shows the full message in a dialog. Users can dismiss the dialog, click
outside it, or delete the message. Tapping anywhere outside the open Notification
Center closes it, while taps on the bell or inside the inbox continue to work.

Billing-backed notifications use the same inbox. Plan activation and changes,
renewals, cancellation changes, payment failures and recovery, plan end, and
credit refills create account-level `billing` or `credit` messages. Their
dedupe key is shared with the matching transactional-email communication, so a
retried Stripe webhook cannot create a second alert. Stripe Checkout redirects
never create a notification.

## When Notifications Are Created

Single user-facing saves create one notification:

- UGC and Demo upload completion through `videoClips.save` and
  `videoClips.saveFromMediaWorker`
- Clipr and Swapr clip completion through `videoClips.saveFromMediaWorker`
- Manual Stitchr saves through `stitches.save`
- Manual Swipr saves through `swipes.save`
- Avatar records through `avatars.save`, including create-avatar-from-UGC flows
- Avatar/photo assets through `photoAssets.save` and non-automation
  `photoAssets.saveFromProvider`
- Verified Stripe subscription, payment, and credit transitions through the
  focused helpers under `convex/accountEmail`

Automated or batch work creates one grouped notification when the full run is
done, not one message per output. `automationTasks.markStatus`,
`automationTasks.markProviderStatus`, and `automationTasks.markMediaStatus`
only mark the run complete when all tasks in that run are complete. Stitchr
Batch uses `automationStitchr.recordOutputFromMediaWorker` because it does not
create a normal automation run document.

## Backend Files

- `web/convex/schema.ts` defines the `notifications` table and indexes.
- `web/convex/notifications.ts` exposes list, read, read-all, delete, and
  clear-all mutations.
- `web/convex/createNotification.ts` inserts deduped notifications.
- `web/convex/createCompletedRunNotification.ts` creates grouped automation
  and Stitchr Batch completion notifications.
- `web/convex/accountEmail/enqueueAccountCommunication.ts` pairs one durable
  account email with one deduplicated billing or credit notification.
- `web/convex/markAutomationRunStatus.ts`,
  `web/convex/markAutomationRunCompletedIfAllTasksDone.ts`, and
  `web/convex/markAutomationRunCompletedWhenTasksDone.ts` keep run completion
  and grouped notification creation aligned.

## Frontend Files

- `web/lib/clipstitchr/hooks/useDashboardNotifications.ts` loads inbox data and
  wraps notification mutations.
- `web/lib/clipstitchr/hooks/useDismissOnOutsidePointer.ts` closes the open inbox
  when a mouse, touch, or pen press starts outside the bell and popover.
- `web/app/_components/dashboard/DashboardNotificationBell.tsx` owns the bell,
  popover state, and selected message state.
- `web/app/_components/dashboard/NotificationListPopover.tsx` renders the
  anchored inbox.
- `web/app/_components/dashboard/NotificationListItem.tsx` renders each inbox
  row.
- `web/app/_components/dashboard/NotificationDetailDialog.tsx` renders the full
  message dialog.
- `web/app/_components/dashboard/NotificationUnreadBadge.tsx` renders the red
  unread count.
- `web/app/_components/dashboard/DashboardTopBar.tsx` places the desktop bell,
  while `DashboardSidebar.tsx` places the mobile bell.

## Abuse Protection

Notification creation happens after already-limited content operations or
worker-only automation finalizers. Inbox actions are user-triggered Convex
mutations and consume the shared metadata/delete buckets before mutating
notification records.
