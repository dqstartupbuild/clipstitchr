# 9:16 App Demo Video Checker

## What It Does

The 9:16 App Demo Video Checker gives app founders and marketers a private
preflight report before they use a demo as the product moment in a vertical ad.
It is available at `/tools/9-16-app-demo-video-checker`.

The result is useful before the visitor joins the mailing list. The checker
does not convert, resize, upload, save, or download a replacement video.
ClipStitchr remains a paid production product.

## Checks and Scoring

The report uses ClipStitchr's durable production baseline rather than mutable
ad-network certification:

| Check | Weight | Result rule |
| --- | ---: | --- |
| 9:16 display aspect ratio | 30% | Passes within `0.005` of `9 / 16`; otherwise it is a critical failure. |
| Resolution | 20% | 1080x1920 or larger passes, 720x1280 or larger warns, and lower fails. |
| Browser video playback | 20% | An undecodable primary video track is a critical failure. |
| Container and codec | 10% | MP4 with AVC passes; another decodable format warns. |
| Estimated frame rate | 10% | 24–60 FPS passes; another or unavailable estimate warns. |
| Audio | 5% | No audio is valid. Decodable AAC passes, another decodable codec warns, and undecodable audio fails. |
| Color and pixel shape | 5% | Known SDR with square pixels passes; HDR, non-square, or unknown facts warn. |

Passes earn full weight, warnings earn half, and failures earn none. A score of
85 or more with no critical failure is **Ready**. A score from 60 to 84 with no
critical failure is **Almost ready**. Every other result is **Needs changes**.

Duration, file size, bitrate, rotation, and track counts are shown as facts,
not changing platform limits. Non-zero rotation and multiple tracks produce
compatibility notes without changing the score.

## Page Flow

1. The visitor chooses or drops one local video.
2. The shared browser-local inspector reads the file with Media Bunny.
3. The page shows a local preview, weighted result, file facts, compatibility
   notes, and a transparent check-by-check report.
4. A paid-plan call to action explains where ClipStitchr continues the work.
5. The existing tool lead form lets the visitor explicitly join the mailing
   list with source `9-16-app-demo-video-checker`.
6. Visible FAQ content matches the page's `FAQPage` structured data.

## Privacy and Abuse Surface

The check itself has no backend operation. Video bytes and technical facts stay
in the browser and are not sent to analytics. File replacement cancels and
disposes stale inspection work. The page's only shared write is the existing,
rate-limited tool lead form.

## File Tree

```text
web/app/(content)/tools/9-16-app-demo-video-checker/page.tsx
web/app/_components/tools/9-16-app-demo-video-checker/
  NineBySixteenVideoChecker.tsx
  NineBySixteenVideoCheckerFaq.tsx
  NineBySixteenVideoCheckerGuide.tsx
  NineBySixteenVideoCheckerHero.tsx
  NineBySixteenVideoCheckerPage.tsx
  NineBySixteenVideoCheckerPricingCta.tsx
  NineBySixteenVideoCheckerResults.tsx

web/lib/clipstitchr/tools/nineBySixteenVideoChecker/
  NineBySixteenVideoStatus.ts
  createNineBySixteenCompatibilityNotes.ts
  createNineBySixteenVideoChecks.ts
  getNineBySixteenVideoStatus.ts
  nineBySixteenVideoCheckerDescription.ts
  nineBySixteenVideoCheckerFaqs.ts
```

Shared inspection files are documented in
`docs/features/editor/browser-local-video-inspection.md`.

## Verification

Focused tests cover the perfect 1080x1920 path, workable 720x1280 warnings,
landscape critical failure, silent video, alternate codecs, unavailable frame
rate, HDR and pixel warnings, undecodable video, rotation and multiple-track
notes, metadata, structured data, lead source, discovery links, and paid-only
copy.

## Source References

- `docs/features/public-tools/portfolio/public-tool-batch-3-10-design.md`
- `docs/features/editor/browser-local-video-inspection.md`
- `project-scope.md`, section 7
- `docs/references/media-bunny/guides.md`
- `docs/references/media-bunny/api.md`
- `web/lib/clipstitchr/constants/tiktokOutputSize.ts`

The candid release status and next refinement are recorded in
`docs/features/public-tools/portfolio/public-tool-quality-register.md`.
