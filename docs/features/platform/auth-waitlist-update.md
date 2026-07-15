# Auth UI and Waitlist Update

## Summary

- Added branded first-party `/sign-in` and `/sign-up` routes so authentication appears inside the ClipStitchr application shell instead of a blank Clerk default page.
- Redesigned both routes around the public campaign-production system: the same
  warm graphite and copper split used by the marketing close, short
  account-specific copy, and a real populated ClipStitchr dashboard capture
  with a numbered product capability register. The product image is hidden on
  small screens so the account action remains immediate.
- Updated Clerk configuration in the root layout and middleware proxy so sign-in redirects, protected dashboard redirects, and sign-up links resolve to the new app routes.
- Replaced the public sign-up experience with an invite-only waitlist CTA because account creation is currently disabled.
- Added a Convex `waitlist` table and public `waitlist.submit` mutation that stores name, email, normalized email, source, and timestamps.
- Added server-side Convex rate limits for waitlist submissions before database writes: per normalized email and shared global buckets.
- Documented the new waitlist rate-limit enforcement in `docs/operations/security/rate-limits.md`.
- Added Clerk route environment examples for deployments in `web/.env.example`.

## Files Changed

- `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `web/app/_components/auth/AuthPageShell.tsx`
- `web/app/_components/auth/AuthProductPreview.tsx`
- `web/app/_components/auth/WaitlistForm.tsx`
- `web/app/globals.css`
- `web/app/layout.tsx`
- `web/proxy.ts`
- `web/.env.example`
- `web/convex/schema.ts`
- `web/convex/waitlist.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/_generated/api.d.ts`
- `docs/operations/security/rate-limits.md`

## Abuse Surface

The waitlist form is public and unauthenticated, so it can create Convex writes
without a signed-in user. The mutation validates inputs, upserts by normalized
email to avoid duplicate rows, rate-limits each normalized email, and applies a
global shared limit before inserting or patching the row.

## Visual Verification

Verify `/sign-in` and `/sign-up` at desktop and mobile sizes. The primary form
must remain readable above the fold, product copy must never clip against the
split edge, the dashboard capture must use the real committed product image,
and the layout must not overflow horizontally. Do not submit the live waitlist
form during a visual smoke test.
