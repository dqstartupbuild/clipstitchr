# Subscription Holds and Review Resume

Social publishing uses the existing effective billing entitlement. Active and
valid grace access may publish. Cancel-at-period-end access may schedule only
before `currentPeriodEnd`. Inactive or billing-review-required access cannot
connect, schedule, refresh analytics, claim due work, initialize a provider
post, or run Instagram's final publish.

Billing transitions call the existing never-started queue cancellation path.
That path now holds unclaimed social targets instead of deleting them. A due
claim repeats the same check, so a delayed billing webhook cannot let expired
work through.

Status reconciliation for a provider request that already started is allowed
to continue after an entitlement change. It can only read and record the
provider outcome. Any later public mutation, including Instagram's final media
publish after container processing, repeats the billing check and moves the
target to review when access is no longer active.

Reactivation never publishes missed work automatically. Held targets are not
selected by the due planner. The user must open Schedule and choose `Review and
resume`:

- a fully missed product-queue post moves to the next open future slot;
- an exact-time or partially published post requires a new future date;
- current platform controls can be refreshed and edited first;
- the user must review the final destination choices and give fresh consent
  before held work returns to the schedule;
- cancellation remains available.

The renewed consent record stores the approval time and the exact platform
controls being resumed. Direct TikTok posts repeat TikTok's Music Usage
Confirmation and, when applicable, its Branded Content Policy beside the final
resume action. Editing a title, caption, or future exact time does not invent a
new approval timestamp.

The delivery stores the latest entitlement decision and next-attempt time for
support review. Relevant code is in
`web/convex/billing/assertOwnerCanPublishSocial.ts`,
`web/convex/socialPublishing/holdNeverStartedSocialTargetsForOwner.ts`, and
`web/convex/socialPosts/reviewAndResumeSocialPost.ts`.
