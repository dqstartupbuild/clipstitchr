# Open Automation Decisions

Reviewed: 2026-05-31

This document closes the open automation questions from `automation.md` so the
implementation has one product direction.

## Global Window

Users do not set a timezone or preferred generation window. Automation uses one
global UTC window for the whole app:

```text
09:00 UTC through 13:00 UTC
```

This is early morning for the United States, which matches the goal of waking up
to new draft content. Operators can change the global window in deployment
configuration through `AUTOMATION_GLOBAL_WINDOW_START_UTC` and
`AUTOMATION_GLOBAL_WINDOW_END_UTC`, but it is not a user setting.

## Tool Cadence

Automation runs all enabled tools every day.

Reason: the product promise is a daily content supply, and the user-specified
daily counts are already conservative. Weekday-specific scheduling can be added
later without changing the job ledger.

## Credits

Automation should eventually count against paid plan entitlements or a separate
automation credit balance, but the current implementation starts with dedicated
daily automation limits plus global provider caps.

Reason: this keeps manual limits intact while still protecting background spend.

## Storage Cap

Users do not set an automation-specific storage cap in the first implementation.
The app saves automation outputs as drafts and relies on existing delete/archive
flows plus future plan-level storage controls.

Reason: per-user storage caps need product billing rules that are not defined
yet. The automation ledger stores provenance so cleanup can later target
automation drafts safely.

## Draft Retention

Automatic drafts are not auto-deleted in the first implementation.

Reason: the app is a content library. Removing drafts automatically could delete
usable creative before a user reviews it. Future retention should be opt-in or
plan-based and should archive before deletion.

## Stitchr Demo Selection

Stitchr automation prefers product-linked Demo clips when the run has a product
snapshot. If there are too few product-linked Demos, it falls back to all owned
Demo clips so the daily generation can still run.

Reason: product relevance matters, but the MVP should avoid skipping useful
automation when a user's library is small.

## Stitchr Text Overlays

Automatic Stitchr text overlays are deferred until the core automation media
pipeline is stable.

Reason: generating useful ad copy requires product/hook policy and preview
quality controls. The first Stitchr automation pass should prove source
selection, pair diversity, background rendering, and draft saving.

## Swapr Defaults

Automatic Swapr uses the manual page's conservative defaults: Fast 720p
(`std`), Match Photo orientation (`image`), original audio off, and a generic
natural UGC prompt. The planner only selects provider-ready UGC references from
3 to 10 seconds for this first executor phase.

Reason: automation should not ask the user for extra per-run settings, and the
short provider-ready constraint avoids depending on browser-side segment
creation. Longer automatic Swapr references should move through the media worker
once server-side segment creation and finalization are wired.
