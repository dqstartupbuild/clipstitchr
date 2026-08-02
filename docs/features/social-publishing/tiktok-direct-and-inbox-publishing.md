# TikTok Automatic and Finishing Modes

## Post automatically

TikTok `DIRECT_POST` requires current creator information. When compose opens,
ClipStitchr requests a fresh capability query, clears any prior choice
snapshot while it runs, and shows the returned nickname and privacy options.
Privacy starts blank. Comments, Duet, and Stitch start off, and unavailable
interactions are disabled. The user can edit title, caption, hashtags,
disclosure choices, and visibility before approving.
For direct videos, the review also asks whether the video was generated or
significantly edited with AI. When selected, ClipStitchr sends TikTok's
`is_aigc` flag so TikTok can apply its AI-generated content label. Photo posts
and inbox delivery omit that field because their current provider contracts do
not accept it.
Paid branded content cannot use TikTok's `SELF_ONLY` visibility. The compose
controls remove that choice while the disclosure is selected, the save
mutation rejects an invalid combination, and the worker checks it again before
the provider call.
Commercial content starts off. Turning it on requires the creator to identify
their own brand, a paid partnership, or both. The review checkbox includes
TikTok's Music Usage Confirmation and adds the Branded Content Policy when a
paid partnership is selected. Changing post choices clears the prior review.
If a refresh removes the selected privacy choice or the video exceeds the
account's current maximum duration, the review UI blocks approval and explains
the mismatch.

The worker queries creator information again immediately before initialization.
If privacy, interaction support, or maximum video duration changed, the target
becomes `needs_attention`. ClipStitchr never silently changes the saved choice.
After TikTok accepts the initialization and a `publish_id` is durable, later
status reconciliation skips capability revalidation and checks only that
accepted operation. A later account-setting change therefore cannot strand or
restart an already accepted delivery.

## Send to TikTok for finishing

Video inbox mode calls TikTok's upload-to-inbox endpoint. The UI explains that
the user must finish in TikTok. Provider acceptance becomes `Waiting for you in
TikTok`, not `Posted`. A later TikTok status or webhook may return zero, one, or
several public IDs; each ID gets its own publication record before analytics
can include it.
Visibility, interaction, music, and disclosure controls are not shown for
inbox delivery because those choices are made in TikTok and are not sent by the
inbox API.

Photo posts are direct-only. ClipStitchr does not add a promotional watermark.
The in-house Swipe path renders JPEG photos because TikTok's Content Posting
API accepts pulled photos as JPEG or WebP. Scheduling checks the final format,
dimensions, and 20 MB per-photo limit before any provider request can begin.

The worker records `publish_id` before polling. Network loss or a server error
around an initialization that may have succeeded becomes `outcome_unknown`.
Only status reconciliation is permitted from that point.

Implementation:

```text
web/app/_components/social/SocialTikTokTargetControls.tsx
web/services/provider-worker/social/tiktok/
web/convex/socialPublishing/
```

Official references:
[direct post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post),
[upload video](https://developers.tiktok.com/doc/content-posting-api-reference-upload-video),
[creator info](https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info),
and [status](https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status).
