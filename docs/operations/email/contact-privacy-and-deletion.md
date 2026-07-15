# Marketing Contact Privacy Deletion

## What It Does

The privacy-deletion operator removes the app-owned identity and recognition
links for one canonical marketing contact, then removes the matching Loops
contact by its opaque provider `userId` when the matching provider team is
configured. It never accepts an email address, name, browser token, or tool
answer.

Deleting server data does not remove the non-identifying browser unlock marker.
That marker stays on the visitor's device until they clear ClipStitchr site
data, so a privacy request does not take away tool value already unlocked.

## Operator Flow

`marketingContacts/deleteMarketingContactForPrivacyOperator:deleteMarketingContactForPrivacyOperator`
is a dedicated-secret-authorized Convex action. Its input is:

- `contactId`: the stable Convex marketing-contact ID, not an email address.
- `secret`: `PRIVACY_DELETION_OPERATOR_SECRET` from the matching deployment.

The action derives the deletion timestamp from server time after it validates
the operator secret. Callers cannot backdate or schedule a privacy deletion.

Run it only from an approved operator runner that keeps the secret out of shell
history and logs. Resolve the contact ID during the reviewed privacy-request
process; do not add a public email lookup endpoint.

The action returns only non-sensitive state:

- `deleted: false`, `providerDeletion: "not-found"` when no local contact exists.
- `deleted: true`, `providerDeletion: "not-configured"` when the local deletion
  and durable delete operation committed but a matching Loops API key/team is
  unavailable.
- `deleted: true`, `providerDeletion: "queued"` when durable provider cleanup
  can run.

Retry the same contact ID after correcting provider configuration. The local
operation is idempotent, retains only the opaque provider key needed for
cleanup, resumes held delete operations, and never recreates consent or
marketing work.

## Deletion Transaction

The internal mutation performs one atomic app-owned cleanup:

1. Withdraw every consent record and remove legacy waitlist links.
2. Delete migrated legacy waitlist rows that contain name or email.
3. Replace canonical name and email fields with deletion sentinels.
4. Mark the contact unsubscribed, unverified, privacy-deleted, and ineligible.
5. Remove first/latest tool attribution and current-consent links.
6. Revoke every server-side browser recognition-token association.
7. Cancel every non-delete provider operation, including unsubscribe updates.
8. Create or resume one durable initial `contactDelete` operation.
9. Fence every in-flight or acceptance-unknown provider call with one delayed
   final delete.

The provider processor uses only `providerContactKey` to call Loops contact
deletion. A late acceptance or ambiguous completion expedites the matching
final delete instead of creating a duplicate. Provider `404` means the desired
state already exists. Deletion uses the normal lease, 8 requests/second pacing,
bounded retry, and dead-letter state. It does not depend on
`LOOPS_EMAIL_ENABLED`, because a privacy request must still work while sending
is paused. It does require:

- `CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT`
- a matching `LOOPS_TEAM_ENVIRONMENT`
- `LOOPS_API_KEY`

## Abuse And Failure Bounds

- A constant-time comparison checks the dedicated operator secret before any
  mutation.
- The local deletion consumes the shared
  `marketingPrivacyDeletionOperator` limit: 100/hour with burst 20.
- The Loops call also consumes the normal shared 8 requests/second provider
  bucket.
- A failed provider call never restores local PII. Transient and ambiguous
  deletes retry up to seven actual SDK attempts; deletion by stable `userId` is
  idempotent and may retry beyond the email-send idempotency window.
- No raw name, email, secret, provider response body, browser token, or tool
  output is logged or returned.

## File Tree

```text
web/convex/auth/assertPrivacyDeletionOperatorSecret.ts
web/convex/email/enqueueContactDeleteCompensation.ts
web/convex/email/enqueueInitialContactDeleteOperation.ts
web/convex/email/processEmailProviderOperation.ts
web/convex/email/resumeHeldContactDeleteOperationsForContact.ts
web/convex/marketingContacts/deleteMarketingContactForPrivacyOperator.ts
web/convex/marketingContacts/deleteMarketingContactForPrivacy.ts
web/convex/rateLimiter.ts
web/lib/clipstitchr/email/loops/getLoopsPrivacyDeletionConfiguration.ts
web/lib/clipstitchr/email/loops/deleteLoopsContact.ts
```

Focused tests cover authorization, local cleanup, token revocation, legacy PII
deletion, provider pacing, opaque-key deletion, missing provider configuration,
provider absence, unsubscribe cancellation, and the late-acceptance race.
