# Stripe Component Evaluation

Reviewed: 2026-05-22

## Initial Request And Instructions

The request was to evaluate whether ClipStitchr can benefit from the Convex
Stripe component, without implementing it yet. The requested output was a new
Markdown evaluation file.

No package has been installed and no application code has been changed.

## Component Evaluated

- Package: `@convex-dev/stripe`
- Current npm latest verified on 2026-05-22: `0.1.4`
- Peer dependencies shown by npm: `convex ^1.29.3` and
  `react ^18.3.1 || ^19.0.0`
- Runtime dependency shown by npm: `stripe ^20.0.0`
- ClipStitchr currently uses `convex ^1.38.0` and `react 19.2.4`, so the
  current app satisfies the peer ranges.

The component adds Stripe Checkout, customer creation, customer portal sessions,
subscription management, seat quantity updates, webhook handling, and component
tables for customers, subscriptions, payments, invoices, and checkout sessions.

## Decision

Yes. ClipStitchr should use the Convex Stripe component when billing or paid
plan enforcement becomes a product requirement.

It is not needed for the current free MVP flows, but the repo already has a
disabled `SettingsSubscriptionPanel`, TikTok purchase tracking helpers, and
`project-scope.md` lists billing/subscription as a production-polish item. When
that work starts, this component is the right default because it keeps Stripe
state synchronized into Convex and lets the app query subscription/payment data
reactively.

## Where It Helps

### Subscription checkout

ClipStitchr will likely need simple hosted subscription checkout before it needs
a custom payment UI. The component's `StripeSubscriptions` client can create
Stripe Checkout sessions from Convex actions and link the checkout to the
authenticated Clerk user through metadata.

This matches the likely early pricing shape:

- free or trial access;
- Creator/Pro monthly subscription;
- higher AI generation limits for paid users;
- possible one-time credit purchases later.

### Customer portal

The component supports customer portal session creation. That fits the current
settings placeholder for "Plan management" because Stripe's portal can handle
payment method updates, invoices, subscription changes, and cancellations
without building a custom billing UI first.

### Webhook-backed source of truth

Billing should not rely on the browser returning to a success URL. Stripe
webhooks are the correct way to synchronize subscription status, invoice
payment, and payment failures.

The component's webhook route and synced component tables reduce the amount of
custom webhook persistence ClipStitchr would otherwise need to write.

### Realtime billing state in Convex

Because the component stores Stripe data inside Convex component tables,
ClipStitchr can expose authenticated wrapper queries for:

- current subscription status;
- payment history;
- invoice history;
- whether a user should see the customer portal button;
- plan gating and support diagnostics.

## What Still Needs Custom App Logic

The Stripe component should not be the only billing model in the app. It stores
Stripe records, but ClipStitchr still needs its own product-level entitlement
model.

Add app-owned state for:

- plan IDs and allowed Stripe price IDs;
- active entitlement tier;
- AI credit or generation quota policy;
- monthly reset rules;
- paid subscription activation behavior;
- grace-period behavior after failed payment;
- cancellation behavior;
- admin overrides or support credits;
- audit logs for entitlement changes.

For expensive provider features, entitlement checks must happen before
provider calls and before rate-limit consumption that represents paid usage.
Rate limits still protect shared infrastructure; entitlements decide what a
given user is allowed to do.

## What It Does Not Solve

The component does not define ClipStitchr pricing. Plans, usage limits, credit
budgets, paid access activation, and cancellation policy still need product
decisions. ClipStitchr does not offer a free plan or trial.

The component does not replace rate limits. AI generation, R2 signed URLs,
provider calls, polling, and Convex writes still need the existing rate-limit
model in `docs/operations/security/rate-limits.md`.

The component does not automatically update the app UI. ClipStitchr still needs
wrapper queries/actions, a real settings billing panel, plan badges, blocked
states, and upgrade prompts.

The component does not replace privacy and analytics rules. TikTok `Purchase`
events should fire only after Stripe confirms payment through webhook-backed
state, not merely after a checkout redirect.

The component does not remove Stripe setup work. Stripe products/prices,
customer portal configuration, webhook endpoints, tax settings, coupon/trial
rules, and test/live mode promotion still need explicit setup.

The package is young. The current latest version is `0.1.4`, so implementation
should keep the integration thin, documented, and easy to replace or patch if
the component API changes.

## Recommended Billing Shape

Start with hosted Checkout and the customer portal rather than a custom card
collection UI.

Suggested first billing model:

- One paid subscription tier.
- Stripe Price IDs stored in server-side env or a small app config module.
- A Convex wrapper action to create a subscription checkout session.
- A Convex wrapper action to create a customer portal session.
- A Convex wrapper query to return the current user's billing summary.
- A small app-owned `billingEntitlements` or `userPlans` table derived from
  Stripe webhook state.
- No usage-based billing in the first pass unless the product explicitly needs
  paid credit packs.

Use Stripe metadata to link records:

- `userId`: Clerk subject.
- Optional `orgId` later if team billing is introduced.
- Optional `planKey` or `entitlementTier` for app-owned policy.

Do not trust client-provided `priceId` directly. The server should validate
requested plan keys against an allowlist of active Stripe price IDs.

## Abuse And Rate Limit Requirements

Adding billing creates new user-triggered backend operations and must follow
the repo's abuse-protection workflow.

Before implementation is complete:

- Rate-limit checkout session creation per authenticated user.
- Rate-limit customer portal session creation per authenticated user.
- Validate every requested price/plan on the server.
- Use idempotency for customer creation and any app-owned entitlement writes.
- Keep Stripe webhook verification enabled.
- Make webhook handling idempotent because Stripe can deliver duplicate events.
- Update `docs/operations/security/rate-limits.md` with checkout, portal, webhook, and any
  entitlement mutation limits or explicit no-limit rationale.

Webhook routes are provider-called and should not use the same user-facing
limits as checkout creation, but they must verify Stripe signatures and process
events idempotently.

## Analytics Requirements

The existing TikTok docs already say subscription purchase tracking should use
`trackSubscriptionPurchase` only after checkout or the billing provider confirms
a completed paid subscription.

For Stripe integration, the safe trigger is webhook-backed confirmation:

- `checkout.session.completed` can mark checkout completion.
- invoice/payment events should be used to confirm paid subscription state.
- purchase conversion should be sent once, idempotently, after the app knows
  the subscription or payment is valid.

Avoid sending plan names, customer emails, Stripe customer IDs, invoice IDs, or
Convex document IDs to TikTok as raw analytics properties. Use only plan
metadata, currency, and purchase value unless privacy review approves more.

## Implementation Notes For Later

Expected touchpoints:

- `web/convex/convex.config.ts`: install the Stripe component.
- `web/convex/http.ts`: register `/stripe/webhook`.
- `web/convex/stripe.ts`: wrap checkout, portal, and read queries behind Clerk
  auth.
- `web/app/_components/settings/SettingsSubscriptionPanel.tsx`: replace the
  disabled placeholder with real plan and portal controls.
- New app-owned billing/entitlement module: map Stripe state to feature limits.
- `docs/operations/security/rate-limits.md`: document billing-related limits.
- `docs/integrations/analytics/tiktok.md`: document purchase conversion trigger after
  Stripe confirmation.
- Privacy/terms pages: disclose billing provider behavior.

## Testing Requirements

Before production:

- Use Stripe test mode only.
- Test webhook delivery locally with the Stripe CLI.
- Verify checkout success, cancellation, failed payment, subscription update,
  subscription cancellation, and customer portal return flows.
- Verify duplicate webhook events do not duplicate entitlements or analytics
  conversions.
- Verify a user cannot create checkout for an unapproved price ID.
- Verify a user cannot view or manage another user's billing state.
- Verify paid feature gates fail closed when Stripe state is unavailable.

## Recommendation

Adopt when paid plans or paid AI credits are ready to implement.

Stripe is the strongest "yes" among these two new evaluations because billing
is already in the product scope and the app has a placeholder settings panel.
The component should be used as Stripe synchronization and checkout plumbing,
while ClipStitchr owns entitlements, plan policy, rate limits, and product UI.

## Sources

- npm package: https://www.npmjs.com/package/@convex-dev/stripe
- GitHub repository: https://github.com/get-convex/stripe
- Convex component page: https://www.convex.dev/components/stripe
- Convex components docs: https://docs.convex.dev/components/using
- Convex HTTP actions docs: https://docs.convex.dev/functions/http-actions
- Stripe webhooks docs: https://docs.stripe.com/webhooks
- Stripe subscription Checkout docs:
  https://docs.stripe.com/payments/checkout/build-subscriptions
- Stripe customer portal docs: https://docs.stripe.com/customer-management
