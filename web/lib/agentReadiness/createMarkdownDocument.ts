const documents: Record<string, string> = {
  "/": "# ClipStitchr\n\nClipStitchr helps app builders turn UGC clips and product demos into finished vertical ads for TikTok, Instagram Reels, and YouTube Shorts. Start at [the homepage](/), read [developer resources](/developers), or inspect [the API specification](/openapi.json).\n",
  "/about": "# About ClipStitchr\n\nClipStitchr is a production workspace for app marketers who need short-form creative without spending every week in a video editor. It keeps clips and demos organized, supports UGC-plus-demo stitching, and explains how browser processing and saved media work. Read [the full About page](/about), [privacy details](/privacy), or [contact support](/contact).\n",
  "/contact": "# Contact ClipStitchr\n\nFor account, billing, saved media, or product help, email [support@followusai.com](mailto:support@followusai.com). Do not send passwords, payment card numbers, private keys, or sensitive media. Read [Privacy](/privacy) for handling details and [Developer Resources](/developers) for public API questions.\n",
  "/developers": "# ClipStitchr Developer Resources\n\nClipStitchr provides an unauthenticated public REST endpoint for deterministic app-ad hook generation. Start with [OpenAPI](/openapi.json), discover capabilities at [/api/v1](/api/v1), and call [POST /api/v1/hooks](/api/v1/hooks). Public errors are JSON with code, message, and resolution. This endpoint shares the App Hook Generator rate limit; honor Retry-After after a 429. Dashboard and stored-media APIs are authenticated and are not public.\n",
};

export function createMarkdownDocument(pathname: string) {
  return documents[pathname];
}
