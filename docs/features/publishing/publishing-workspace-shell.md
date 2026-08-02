# Publishing Workspace Shell

## Purpose

ClipStitchr retains the focused Postiz publishing navigation as a nested task
workspace. Calendar, Posts, Analytics, and Integrations stay separate instead
of becoming one consolidated publishing hub.

The adapter and route screens are present in source, but product entry points
remain gated on a usable publishing backend. Implementing the workspace does
not declare the Post Bridge cutover complete.

## Source Relationship

`PublishingWorkspaceShell` directly imports the retained
`LayoutComponent` from the pinned Postiz source boundary. That component owns
the compact publishing navigation and its route relationship. The ClipStitchr
adapter supplies only a scoped wrapper for responsive behavior and established
ClipStitchr design tokens.

The imported shell was modified and hashed under
`web/vendor/postiz/provenance.json`. It needs only React and Next.js at runtime.
The broader archived Postiz UI is not compiled or mounted wholesale.

## Route Relationship

| Task | Route |
| --- | --- |
| Calendar | `/dashboard/publishing/calendar` |
| Posts | `/dashboard/publishing/posts` |
| Analytics | `/dashboard/publishing/analytics` |
| Integrations | `/dashboard/publishing/integrations` |

`/dashboard/publishing` enters Calendar. The screens load only real
tenant-scoped publishing API data and fail visibly when that service is not
available. Existing Schedule and Analytics product entry points remain
unchanged until the cutover gate is complete.

## Responsive Behavior

On wider screens the publishing navigation stays in its narrow vertical rail.
On small screens it becomes a horizontally scrollable task bar above the
workspace. Content remains visible by default. The adapter does not use an
entrance animation, hover lift, glow, pill chip, decorative active dot, or
fixed-height clipping.

The primary ClipStitchr dashboard shell will remain outside this nested shell.
Route mounting must avoid nested `main` landmarks by using the dashboard
shell's non-landmark content wrapper while the imported publishing layout owns
the page's `main` landmark.

## Files

```text
web/app/_components/publishing/
  PublishingWorkspaceShell.tsx
  PublishingWorkspaceShell.test.tsx
web/app/dashboard/publishing/
  layout.tsx
  page.tsx
  calendar/page.tsx
  posts/page.tsx
  analytics/page.tsx
  integrations/page.tsx
  compose/page.tsx
web/vendor/postiz/apps/frontend/src/components/
  layout/top.menu.tsx
  new-layout/layout.component.tsx
  new-layout/menu-item.tsx
```

## Verification

The focused test verifies all four route links, the active task treatment,
rendered child content, and removal of Postiz product copy. Full pointer,
keyboard, focus, overflow, desktop, and mobile checks remain part of the route
mounting and final browser QA gate.
