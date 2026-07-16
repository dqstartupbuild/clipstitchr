# Paid Signup and Onboarding

## What It Does

The paid signup flow carries one exact plan choice from the public pricing page
through account creation, Stripe-hosted Checkout, signed webhook confirmation,
and first-product onboarding.

The supported path is:

1. The visitor chooses Starter, Pro, or Agency on `/pricing`.
2. The link opens `/sign-up?plan=<plan>`.
3. The account page names the selected plan and monthly price before Clerk asks
   the visitor to create the account.
4. Clerk creates the account and always returns the new session to
   `/dashboard/onboarding?plan=<plan>`.
5. Onboarding repeats the selected plan, price, product limit, credits, and
   combined Clipr plus Swapr allowance before payment. The pricing page and
   onboarding also state that plans renew monthly until canceled and remain
   active through the paid month after cancellation.
6. The customer continues to Stripe-hosted Checkout. Before creating it, the
   server checks the authoritative Stripe customer and rejects a second session
   when a nonterminal subscription already exists. An atomic owner claim and a
   Stripe idempotency key also make simultaneous clicks resolve to one hosted
   Checkout session. Stripe requires the customer to accept the published Terms
   of Use before payment can complete.
7. Checkout returns to the same onboarding route for success or cancellation.
8. A success redirect shows a visible confirmation state while Convex waits for
   Stripe's signed webhook.
9. Product setup appears only after the app-owned entitlement projection is
   active or in the supported renewal-grace state. A first invoice that never
   succeeds remains inactive and does not open setup.

A direct signup without a plan shows the three canonical choices inside
onboarding. Invalid, unknown, or repeated query values are discarded and never
reach Stripe. If Checkout cannot open, the selection screen shows the error
without clearing the choices. A selected-plan screen always includes a **Change
plan** link, including after a canceled Checkout, so the customer is never
trapped on one choice. Switching between Clerk's sign-up and sign-in screens
also carries the same validated plan in the destination URL.

## Why Payment Confirmation Is Separate

The browser redirect is not proof of payment. ClipStitchr never creates an
entitlement from `billing=success`. Stripe signs the subscription and invoice
events, Convex validates and processes them idempotently, and the reactive
entitlement query opens onboarding only after that projection changes.

This prevents a visitor from editing a URL to unlock product creation. It also
keeps duplicate, delayed, and out-of-order Stripe events behind the same server
boundary used by every generation path.

## Checkout Return Safety

The Checkout action accepts only two server-defined return targets:

- `settings`
- `onboarding`

It never accepts an arbitrary URL from the browser. The onboarding return URL
is built from the canonical app URL and validated `PlanKey`, so open redirects
and unrecognized plans cannot be inserted into Stripe sessions.

An existing open Checkout session is reused only when both its plan and return
target match the new request. Before any URL reaches the browser, Convex
atomically marks that exact owner, plan, target, intent, and Stripe session as
handed off. A request from another surface or for another plan cannot silently
expire a session already handed to the browser. It asks the customer to finish
or cancel the open Checkout instead.

The Stripe cancellation link carries the server-created Checkout intent back to
ClipStitchr. A retry from that canceled return may explicitly expire only that
exact authenticated intent and create the newly selected plan. If Stripe
expiration is interrupted, the claim stays in an `expiring` state and blocks a
duplicate; the next request reconciles Stripe before continuing. This durable
handoff state prevents ordinary background requests from expiring a URL being
returned. An explicit canceled-intent retry deliberately invalidates that same
Checkout in every tab, so another tab still holding it must use the replacement.
A completed Checkout remains a local barrier until a fresh authoritative Stripe
check proves that no live subscription remains; only then is its operational
barrier retired.
A completed session is never replaced while its payment is still syncing, and
the authoritative Stripe subscription check still blocks duplicate
subscriptions.

## Existing Account and Settings Behavior

If a signed-in customer follows a pricing plan link, Clerk preserves the plan
and sends the session to onboarding. An already-paid account passes the billing
gate without creating a second Checkout session.

Settings keeps a separate **Billing & invoices** portal action. Each
non-current plan row also shows an explicit Stripe action, such as **Upgrade to
Agency in Stripe**. Those actions open Stripe's `subscription_update` portal
flow for the current subscription. Stripe remains responsible for immediate
paid upgrades, next-renewal downgrades, payment details, invoices, and
cancellation.

The comparison keeps its aligned table at desktop width. Below that breakpoint,
an accessible definition list presents every allowance and plan action without
horizontal scrolling. While Checkout or the plan portal opens, only the plan the
customer selected shows progress; the other choices remain still and disabled.
The separate **Billing & invoices** action shows progress only when that general
portal is opening, not while a plan-specific portal action is opening.

Billing return messages, loading text, and entitlement changes use polite status
semantics. Entitlement states are translated into plain customer language such
as **Active**, **Payment needs attention**, and **Ended**. The desktop comparison
uses scoped row and column headers with a descriptive caption, and the recent
usage scroller is named and keyboard focusable.
The Stripe return notice uses an empty server snapshot so URL-only browser state
cannot replace the server's loading markup during hydration.

## Relevant Code

```text
web/
  app/(auth)/sign-up/[[...sign-up]]/page.tsx
  app/(auth)/sign-in/[[...sign-in]]/page.tsx
  app/_components/auth/authComponentAppearance.ts
  app/_components/billing/BillingRenewalDisclosure.tsx
  app/_components/onboarding/OnboardingBillingGate.tsx
  app/_components/onboarding/OnboardingBillingShell.tsx
  app/_components/onboarding/OnboardingPlanCheckout.tsx
  app/_components/onboarding/OnboardingPlanSelection.tsx
  app/_components/settings/BillingPlanAction.tsx
  app/_components/settings/BillingPlanComparison.tsx
  app/_components/settings/BillingPlanDesktopComparison.tsx
  app/_components/settings/BillingPlanMobileComparison.tsx
  app/_components/settings/formatBillingUsageDate.ts
  app/_components/settings/getBillingEntitlementStateLabel.ts
  app/dashboard/onboarding/page.tsx
  convex/stripe/createSubscriptionCheckout.ts
  convex/stripe/createStripeSubscriptionCheckoutSession.ts
  convex/stripe/createPortalSession.ts
  convex/billing/claimSubscriptionCheckoutSession.ts
  convex/billing/beginSubscriptionCheckoutSessionExpiration.ts
  convex/billing/confirmSubscriptionCheckoutSessionReturn.ts
  convex/billing/expireSubscriptionCheckoutSession.ts
  convex/billing/recordCheckoutSession.ts
  convex/billing/retireCompletedSubscriptionCheckoutSessions.ts
  convex/stripe/expireStripeSubscriptionCheckoutSession.ts
  convex/stripe/finishExpiringStripeSubscriptionCheckoutSession.ts
  lib/clipstitchr/billing/getCheckoutIntentIdFromSearchParam.ts
  lib/clipstitchr/billing/getPlanKeyFromSearchParam.ts
  lib/clipstitchr/billing/getPlanSignInHref.ts
  lib/clipstitchr/billing/getPlanSignupHref.ts
  lib/clipstitchr/billing/getOnboardingPlanHref.ts
  lib/clipstitchr/billing/getOnboardingBillingView.ts
  lib/clipstitchr/billing/getSubscriptionCheckoutReturnUrls.ts
  lib/clipstitchr/billing/getBillingPortalSessionParams.ts
```

## Verification

- Unit tests cover canonical and invalid plan parsing, exact signup and return
  URLs, selected-plan signup copy, webhook-lag gating, canceled Checkout recovery,
  simultaneous same-target Checkout claim reuse, durable browser handoff,
  exact canceled-intent replacement, interrupted expiration recovery,
  completion barriers and post-claim Stripe rechecks, Stripe request
  idempotency, Terms consent, renewal disclosure, visible Checkout errors, human
  entitlement labels, accessible billing tables, focused overflow content, and
  Stripe portal parameters.
- Route tests prove that Clerk account creation replaces the former waitlist and
  preserves a selected plan.
- Browser verification must cover pricing to signup, selected-plan Checkout,
  success return, webhook confirmation, canceled Checkout retry, and Settings
  plan changes at desktop and narrow widths.

## Source References

- [Clerk SignUp component](https://clerk.com/docs/reference/components/authentication/sign-up)
- [Clerk sign-up redirect options](https://clerk.com/docs/reference/types/sign-up-redirect-options)
- [Stripe customer portal deep links](https://docs.stripe.com/customer-management/portal-deep-links)
- [Stripe subscription webhooks](https://docs.stripe.com/billing/subscriptions/webhooks)
- `docs/features/billing/paid-plans-and-usage.md`
- `docs/operations/billing/stripe-test-mode-and-production-promotion.md`
