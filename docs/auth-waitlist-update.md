# Auth UI and Waitlist Update

## Summary

- Added branded first-party `/sign-in` and `/sign-up` routes so authentication appears inside the ClipStitchr application shell instead of a blank Clerk default page.
- Updated Clerk configuration in the root layout and middleware proxy so sign-in redirects, protected dashboard redirects, and sign-up links resolve to the new app routes.
- Replaced the public sign-up experience with an invite-only waitlist CTA because account creation is currently disabled.
- Added a Convex `waitlist` table and public `waitlist.submit` mutation that stores name, email, normalized email, source, and timestamps.
- Added server-side Convex rate limits for waitlist submissions before database writes: per normalized email and shared global buckets.
- Documented the new waitlist rate-limit enforcement in `docs/backend/rate-limits.md`.
- Added Clerk route environment examples for deployments in `web/.env.example`.

## Files Changed

- `web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `web/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `web/app/_components/auth/AuthPageShell.tsx`
- `web/app/_components/auth/AuthProductPreview.tsx`
- `web/app/_components/auth/WaitlistForm.tsx`
- `web/app/layout.tsx`
- `web/proxy.ts`
- `web/.env.example`
- `web/convex/schema.ts`
- `web/convex/waitlist.ts`
- `web/convex/rateLimiter.ts`
- `web/convex/_generated/api.d.ts`
- `docs/backend/rate-limits.md`

## Abuse Surface

The waitlist form is public and unauthenticated, so it can create Convex writes
without a signed-in user. The mutation validates inputs, upserts by normalized
email to avoid duplicate rows, rate-limits each normalized email, and applies a
global shared limit before inserting or patching the row.
