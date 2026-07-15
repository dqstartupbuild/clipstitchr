# Short-Form Video Specs Cheat Sheet

## Purpose

The Short-Form Video Specs Cheat Sheet is a dated, filterable reference for app
founders and marketers preparing TikTok, Instagram Reels, and YouTube Shorts
assets. Seven placement-specific records make the differences between general
creative guidance, organic publishing, and paid-ad delivery visible.

Each record exposes aspect ratio, dimensions, duration, container, codec,
frame-rate, audio, file or bitrate limits, practical recording notes, a
first-party source, and a last-verified date.

## How It Works

The records are a versioned local TypeScript collection. Visitors can filter by
platform or search any practical field. The filter runs entirely in the browser
and does not inspect a video or call an outside service.

Every fact is scoped to its linked page and publishing path. When an official
page does not state a requested value, the record says `Not stated on the
linked source page`. The collection does not silently combine requirements
from unrelated placements or fill platform gaps with inferred values.

The initial reference was verified July 12, 2026 and includes:

1. TikTok performance-ad creative guidance.
2. TikTok Reservation In-Feed Non-Spark and Spark Ads Push.
3. TikTok Reservation In-Feed Spark Ads Pull.
4. Organic Instagram Reels.
5. Facebook and Instagram Reels ad creative essentials.
6. General YouTube Shorts ad asset guidance.
7. YouTube Shorts inventory for Demand Gen video assets.

## Use Cases

- Choose a vertical recording canvas before a shoot.
- Confirm whether a stated duration belongs to the intended ad path.
- Give an editor source-linked handoff notes rather than a generic social spec.
- Find which details still need to be checked in the platform uploader.
- Revisit an official page quickly before a high-stakes launch.

## Boundaries

- Reference only: no video upload, inspection, repair, compression, or
  normalization.
- No certification, approval prediction, or claim that specifications are
  permanent.
- Organic and paid records remain separate where their source contracts differ.
- The platform's live uploader and exact placement preview remain authoritative.

## Relevant Code

```text
web/app/(content)/tools/short-form-video-specs-cheat-sheet/page.tsx
web/app/_components/tools/short-form-video-specs/
  ShortFormVideoSpecsPage.tsx
  ShortFormVideoSpecsBrowser.tsx
  ShortFormVideoSpecCard.tsx
  ShortFormVideoSpecField.tsx
web/lib/clipstitchr/tools/shortFormVideoSpecs/
  shortFormVideoSpecRecords.ts
  filterShortFormVideoSpecs.ts
  shortFormVideoPlatforms.ts
  ShortFormVideoSpecRecord.ts
  ShortFormVideoPlatform.ts
  shortFormVideoSpecRecords.test.ts
```

## Source References

Checked July 12, 2026:

- [TikTok creative best practices for performance ads](https://ads.tiktok.com/help/article/creative-best-practices)
- [TikTok reservation In-Feed ad specifications](https://ads.tiktok.com/help/article/tiktok-reservation-in-feed-ads-reach-frequency)
- [Meta: Reel size and aspect ratios on Instagram](https://www.facebook.com/help/1038071743007909)
- [Meta: Instagram and Facebook Reels ads](https://www.facebook.com/business/ads/facebook-instagram-reels-ads)
- [Google Ads: YouTube Shorts ad asset specs and best practices](https://support.google.com/google-ads/answer/16041697)
- [Google Ads: Demand Gen video asset specifications](https://support.google.com/google-ads/answer/17141078)

## Verification

- Collection tests require seven records across all three platforms.
- Every record must include the full field set, three practical notes, the
  `2026-07-12` verification date, and an official TikTok, Meta, or Google host.
- Filter tests cover platform scoping and searchable practical details.
- The page test covers dated records, source links, explicit missing values,
  the exact lead source, and the paid-plan link.

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
