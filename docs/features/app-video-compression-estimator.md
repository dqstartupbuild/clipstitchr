# App Video Compression Estimator

## Purpose

This browser-local calculator estimates output size from duration plus selected
video and audio bitrates. A visitor can choose a local video to fill in duration
and original size or enter those facts manually.

## Calculation

The center estimate is `duration seconds × combined kbps × 1,000 ÷ 8`.
The interface shows an eight-percent range above and below that center because
container and encoder behavior varies. Upload time divides the estimated bits
by the visitor's entered upload speed. Reduction compares the range with the
entered original size and can be negative.

## Files

- Types, defaults, limits, FAQs, calculation, and focused tests:
  `web/lib/clipstitchr/tools/videoCompressionEstimator/`.
- Atomic UI and page tests:
  `web/app/_components/tools/app-video-compression-estimator/`.
- Route: `web/app/(content)/tools/app-video-compression-estimator/page.tsx`.

## Privacy and boundary

Selected files are inspected on the visitor's device and are not uploaded. The
tool does not transcode, compress, repair, store, or produce a file. It does not
promise output quality or exact size.

## Sources

- `docs/content/lead-magnet-portfolio.md`, portfolio item 26.
- `docs/features/public-tool-batch-16-50-design.md`.
- `docs/features/public-tool-quality-register.md`.
