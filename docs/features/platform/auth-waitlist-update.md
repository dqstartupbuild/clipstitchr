# Auth UI and Historical Waitlist

## Summary

- Added branded first-party `/sign-in` and `/sign-up` routes so authentication appears inside the ClipStitchr application shell instead of a blank Clerk default page.
- Redesigned both routes around the public campaign-production system: the same
  warm graphite and copper split used by the marketing close, short
  account-specific copy, and a real populated ClipStitchr dashboard capture
  with a numbered product capability register. The product image is hidden on
  small screens so the account action remains immediate.
- Updated Clerk configuration in the root layout and middleware proxy so sign-in redirects, protected dashboard redirects, and sign-up links resolve to the new app routes.
- Replaced the invite-only `/sign-up` waitlist with Clerk account creation for
  the paid launch. Pricing choices now survive account creation and continue to
  payment-first onboarding.
- Added a Convex `waitlist` table and public `waitlist.submit` mutation that stores name, email, normalized email, source, and timestamps.
- Added server-side Convex rate limits for waitlist submissions before database writes: per normalized email and shared global buckets.
- Documented the new waitlist rate-limit enforcement in `docs/operations/security/rate-limits.md`.
- Added Clerk route environment examples for deployments in `web/.env.example`.

The waitlist table, mutation, form component, and historical analytics remain
available for old records and a possible future campaign, but the account route
does not render or submit them.

## Files Changed

- `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `web/app/_components/auth/AuthPageShell.tsx`
- `web/app/_components/auth/AuthProductPreview.tsx`
- `web/app/_components/auth/WaitlistForm.tsx`
- `web/app/_components/auth/authComponentAppearance.ts`
- `web/app/globals.css`
- `web/app/layout.tsx`
- `web/proxy.ts`
- `web/.env.example`
- `web/convex/schema.ts`
- `web/convex/waitlist.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/_generated/api.d.ts`
- `docs/operations/security/rate-limits.md`

## Account Creation Boundary

Clerk owns identity verification and account-session creation. A validated
pricing `PlanKey` is used only to build a fixed onboarding redirect. It does not
activate a plan or grant usage. Convex opens product setup only after a signed
Stripe event creates a usable entitlement.

## Historical Waitlist Abuse Surface

The waitlist form is public and unauthenticated, so it can create Convex writes
without a signed-in user. The mutation validates inputs, upserts by normalized
email to avoid duplicate rows, rate-limits each normalized email, and applies a
global shared limit before inserting or patching the row.

## Visual Verification

Verify `/sign-in` and `/sign-up?plan=pro` at desktop and mobile sizes. The primary form
must remain readable above the fold, product copy must never clip against the
split edge, the dashboard capture must use the real committed product image,
and the layout must not overflow horizontally. Confirm that a completed signup
returns to `/dashboard/onboarding?plan=pro` and never submits the historical
waitlist mutation.
