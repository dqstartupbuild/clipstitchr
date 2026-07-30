# Social Publishing Browser Acceptance

The in-house social publishing browser suite verifies the real shared controls
at desktop and mobile viewport sizes without contacting TikTok, Instagram,
Convex, R2, or a paid provider.

## What it covers

- pointer operation for account selection, TikTok direct and inbox modes,
  slideshow sound, privacy, direct-video AI disclosure, exact-time scheduling,
  consent, and submission
- keyboard opening, form operation, Escape handling, focus trapping, and focus
  restoration, including toggling the direct-video AI disclosure
- responsive compose-dialog width and full-page horizontal-overflow checks
- modal centering and real wheel scrolling through long content
- product queue add and remove controls
- loading progress and independent multi-account partial-failure feedback
- analytics view, range, and custom date controls
- nullable analytics display, including `Not available` for a missing metric

The tests render production social components inside a development-only
acceptance workspace. Fixture accounts contain no provider credentials, and
submitting the fixture records only local React state.

## Files

```text
web/
  app/browser-tests/social-publishing/page.tsx
  app/_components/browser-tests/
  browser-tests/
  playwright.config.ts
```

The route returns `404` unless the process is in development and
`SOCIAL_BROWSER_TEST_MODE=1`. The Playwright web server sets that variable only
for its isolated server on `localhost:3107`. It also uses
`.next-browser-tests` as a separate Next build directory so an existing
developer server is not interrupted.

## Run

From `web/`:

```bash
npx playwright install chromium
npm run test:browser
```

Playwright starts and stops its own development server. Do not point this suite
at production, add real social credentials to the fixtures, or use the fixture
as evidence of platform approval. Authorized-account provider smoke tests
remain a separate production-launch gate.
