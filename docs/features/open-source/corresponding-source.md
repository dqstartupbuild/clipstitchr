# Corresponding Source Page

## Purpose

ClipStitchr exposes a browser-visible `/source` page so a person using the
network-deployed application can find the source, license, attribution, and
exact revision for that release. The public footer links to this page.

This supports the repository's GNU AGPL version 3 distribution and network-use
obligations. It does not replace release review or legal advice.

## Code

- `web/app/(content)/source/page.tsx` renders the public source page.
- `web/lib/clipstitchr/source/getCorrespondingSource.ts` validates and resolves
  the repository, revision, and archive URLs.
- `web/app/site-footer.tsx` keeps the source page reachable from public pages.

## Release configuration

Set these values for every production release:

- `NEXT_PUBLIC_SOURCE_CODE_URL`: public repository URL for the complete source.
- `SOURCE_CODE_REVISION`: exact public commit deployed by that release.
- `SOURCE_CODE_ARCHIVE_URL`: optional public archive for the exact complete
  source. When omitted, ClipStitchr builds the normal GitHub archive URL from
  the repository and revision.

The page accepts only HTTP or HTTPS URLs and a hexadecimal Git revision. If no
revision is available, it says plainly that the build cannot identify exact
release source. That fallback is useful locally but is not an acceptable
production release state.

## Release check

Before deploying:

1. Build from the same commit named by `SOURCE_CODE_REVISION`.
2. Confirm the repository and archive are available without application
   credentials.
3. Confirm the archive includes the imported Postiz source, provenance
   manifest, license files, build scripts, and all ClipStitchr modifications.
4. Open `/source` in the deployed application and follow both links.
5. Record the check with the release evidence.
