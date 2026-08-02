# Post Bridge Production Inventory: 2026-08-02

## Purpose

This is the first read-only production inventory for the Post Bridge cutover.
It records aggregate state only. No API key, account identifier, caption, media
URL, user identifier, or provider token was read into the report or printed.

Audit time: `2026-08-02T04:35:00.833Z`

## Cloud results

| Measure | Development | Production |
| --- | ---: | ---: |
| Saved Post Bridge settings records | 0 | 1 |
| Post-to-product mappings | 0 | 251 |
| Stitch records with Post Bridge history | 0 | 18 |
| Swipe records with Post Bridge history | 0 | 215 |
| Total recorded post references | 0 | 251 |
| Future scheduled references | 0 | 36 |
| Processing references | 0 | 25 |

The production status totals were 226 `scheduled` and 25 `processing`. The
earliest future schedule was `2026-08-02T11:10:00+00:00`; the latest was
`2026-08-07T23:58:00+00:00`. Processing records were last updated between
`2026-06-27T11:43:34.746Z` and `2026-07-12T10:25:12.539Z`.

Neither scan was truncated at the 10,000-record per-table safety bound.

## Cutover consequence

Post Bridge cannot be deleted yet. The 36 future schedules must complete,
be cancelled with confirmation, or be migrated with proven provider semantics
and idempotency. The 25 old processing records require reconciliation because
their provider outcome may be uncertain. Recreating them blindly could publish
duplicates.

The old creation path can be frozen only after the replacement is usable and a
fresh inventory is captured. The old inspection and reconciliation path must
remain available during the transition.

## Repeating the inventory

`postBridgeCutover/getPostBridgeCutoverInventory:getPostBridgeCutoverInventory`
is an operator-only, read-only Convex query guarded by `RATE_LIMIT_API_SECRET`.
It returns counts and time bounds only. Run it separately against development
and production, then store the JSON with the release evidence. Stop if
`truncated` is true and add a paginated inventory before making a cutover
decision.

Do not add provider-account details, credentials, captions, media URLs, or raw
post payloads to a cutover report.
