# BIMI email logo

## What this provides

ClipStitchr ships its BIMI logo with the web deployment at:

```text
https://clipstitchr.com/brand/v2/bimi-logo.svg
```

The file is a square SVG Tiny Portable/Secure image based on the active 512px
maskable app icon. It contains only vector paths, has no external images,
scripts, animation, or fonts, and can be fetched publicly by inbox providers.

## Relevant code and assets

```text
web/
├── lib/brandAssets.ts                    # Canonical versioned asset URL
└── public/brand/v2/
    ├── icon-maskable-512.png             # Artwork source for the BIMI mark
    └── bimi-logo.svg                     # Public BIMI SVG served by Vercel
```

`web/public/` is copied into the Next.js public output. After the Vercel
deployment that includes this file completes, opening the URL above must return
the SVG without authentication.

## DNS and sender-domain setup

BIMI looks up the domain in the visible `From` address, not the Reply-To
address and not necessarily the domain that hosts this SVG. In Loops, first
confirm the production `From` domain. Add this DNS TXT record in the Cloudflare
zone for that exact domain:

```text
Name:    default._bimi
Type:    TXT
Content: v=BIMI1; l=https://clipstitchr.com/brand/v2/bimi-logo.svg
TTL:     Auto
```

That sending domain also needs aligned SPF and DKIM plus a DMARC policy at
`p=quarantine` or `p=reject`. No VMC is configured for this implementation, so
the record has no `a=` value. A VMC can be added later without changing the
hosted logo URL.

## Verification

1. Deploy the web application to Vercel.
2. Open the public SVG URL and confirm it loads as an image.
3. Confirm the `default._bimi` DNS record resolves on the visible From domain.
4. Validate that domain with the BIMI Group inspector.
5. Send a test message through Loops and check a BIMI-supporting inbox.

## Source references

- [BIMI Group implementation guide](https://bimigroup.org/implementation-guide/)
- [BIMI Group SVG logo requirements](https://bimigroup.org/creating-bimi-svg-logo-files/)
