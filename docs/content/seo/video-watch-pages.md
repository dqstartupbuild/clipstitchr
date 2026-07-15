# Video Watch Page SEO Plan

Last checked against Google Search Central on 2026-05-27.

## Recommendation

Create public, indexable watch pages for curated ClipStitchr example videos.

The landing-page marquee is useful as an example-output reel, but it is not the
strongest video SEO target because it shows many videos with equal prominence.
Google defines a watch page as a page whose main purpose is showing one video,
and it distinguishes that from category or listing pages with multiple equally
prominent videos.

Use watch pages for examples such as:

- Finished UGC-then-demo ad examples.
- Clipr generated engagement clip examples.
- Swapr UGC variation examples.
- Before/after workflow examples when the page includes enough explanatory copy.

Avoid calling these pages customer proof unless the video is actually a public
customer result with permission. For generated or internal examples, use
phrasing such as "example output", "sample ad", or "UGC-style ad example".

## Source Basis

Primary Google references:

- [Video SEO best practices](https://developers.google.com/search/docs/appearance/video)
- [Video structured data](https://developers.google.com/search/docs/appearance/structured-data/video)
- [Video sitemaps and alternatives](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Google's useful points for this project:

- Google can discover videos in standard HTML video embeds, but it should not
  require a user action to load the video.
- Video files and thumbnails need stable, crawlable URLs.
- A dedicated watch page is the right pattern when one video is the primary
  content.
- Structured data can help Google understand the video, but it does not
  guarantee rich results.
- Video sitemaps help Google find recently added or otherwise hard-to-discover
  videos.

## Page Requirements

Each watch page should have:

- One primary video above the fold.
- A visible `<video controls poster="...">` element with a stable `<source>`.
- A unique H1 that describes the exact video.
- A unique meta title and meta description.
- A canonical URL for the watch page.
- A stable thumbnail URL used consistently in the video `poster`, JSON-LD,
  Open Graph image, and video sitemap.
- Short human-readable page copy that explains what the viewer is seeing.
- A contextual CTA back to the product workflow.

Recommended route shape:

```text
/examples
/examples/[slug]
```

The `/examples` page can list examples, but the individual
`/examples/[slug]` pages are the actual watch pages.

## Metadata Model

Add a dedicated public metadata source for curated videos. Do not reuse the
landing marquee labels as the full SEO source; they are accessibility labels,
not search metadata.

Recommended fields:

```ts
type PublicVideoExample = {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoSrc: string;
  thumbnailSrc: string;
  durationSeconds: number;
  uploadDate: string;
  width: number;
  height: number;
  tags: string[];
};
```

Use a real publication date for `uploadDate`. If the original source date is
unclear, use the date the watch page is first published. Do not fake view counts
or engagement statistics.

## Structured Data

Add one `VideoObject` JSON-LD object to each watch page.

Use these fields at minimum:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "UGC Hook and Fitness Demo Ad Example",
  "description": "A vertical example ad showing a creator-style hook followed by a fitness product demo.",
  "thumbnailUrl": "https://clipstitchr.com/example-outputs/posters/ugc-hook-fitness-demo.jpg",
  "uploadDate": "2026-05-27T00:00:00-04:00",
  "duration": "PT12S",
  "contentUrl": "https://clipstitchr.com/example-outputs/clipstitchr-example-11.webm",
  "url": "https://clipstitchr.com/examples/ugc-hook-fitness-demo"
}
```

Implementation notes:

- Prefer `contentUrl` for self-hosted videos because it points to the actual
  video bytes.
- Do not set `embedUrl` unless there is a separate player URL for this exact
  video.
- Add `regionsAllowed` only if there is an actual distribution restriction.
- Add `interactionStatistic` only after real watch counts exist.
- Skip `Clip` or `SeekToAction` at first. Add them later only when the page can
  deep link to timestamps with URLs such as `/examples/example-slug?t=30`.

## Thumbnails

Generate a poster image for each public example and commit or upload it at a
stable URL, for example:

```text
web/public/example-outputs/posters/clipstitchr-example-11.jpg
```

Guidelines:

- Use a non-black, representative frame.
- Prefer a large image over the minimum thumbnail size.
- Keep the same thumbnail URL across the page poster, JSON-LD, Open Graph, and
  video sitemap.
- Do not rotate or crop the thumbnail in a way that misrepresents the video.

For vertical videos, a vertical poster is acceptable for the watch page. If
Open Graph sharing needs a wider preview, create a separate share image, but
keep the video structured-data thumbnail consistent.

## Sitemaps

Add each watch page to the normal sitemap so Google can discover the public URL.

Also add a video sitemap when public examples become a real SEO surface. Next's
typed `MetadataRoute.Sitemap` is good for normal URLs, but video sitemap
extensions are XML-specific. The clean implementation is a dedicated route:

```text
web/app/video-sitemap.xml/route.ts
```

The video sitemap should include:

- `<loc>`: the watch page URL.
- `<video:thumbnail_loc>`: the stable thumbnail URL.
- `<video:title>`: the displayed video title.
- `<video:description>`: the displayed or equivalent page description.
- `<video:content_loc>`: the stable WebM or MP4 file URL.
- `<video:duration>`: duration in seconds.
- `<video:publication_date>`: first public publication date.

Then expose it through `robots.ts` and Search Console:

```text
Sitemap: https://clipstitchr.com/sitemap.xml
Sitemap: https://clipstitchr.com/video-sitemap.xml
```

## Codebase Implementation Plan

1. Create a dedicated example metadata file for public videos.
2. Generate stable poster images for each example video.
3. Build `/examples` and `/examples/[slug]` under the public content route group.
4. Add a `VideoObject` JSON-LD helper in `web/lib/clipstitchr/seo`.
5. Generate page metadata with unique title, description, canonical URL, and
   social preview data.
6. Add example watch pages to the regular sitemap.
7. Add `video-sitemap.xml` once at least a few watch pages are live.
8. Update `robots.ts` to advertise the video sitemap.
9. Validate one deployed page with Google's Rich Results Test and URL Inspection.
10. Monitor Search Console for video indexing and structured-data warnings.

## Acceptance Checklist

- Each watch page is publicly accessible without authentication.
- The video is visible in rendered HTML and not loaded only after a click.
- The video file URL returns `200` for Googlebot and normal users.
- The thumbnail URL returns `200` and is not blocked by `robots.txt`.
- The page is indexable and has no `noindex` tag.
- The JSON-LD matches the visible page content.
- The sitemap includes the watch page.
- The video sitemap includes the same URL, title, description, thumbnail, and
  content URL used on the page.
- The page passes Rich Results Test without critical video structured-data
  errors.

## Non-Goals

- Do not create indexable pages for private user uploads.
- Do not expose R2 signed URLs in structured data; signed URLs are not stable.
- Do not create thin pages that only contain a video and no useful context.
- Do not promise performance improvements or customer outcomes that the video
  does not prove.
