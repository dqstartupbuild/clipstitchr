# TikTok Slideshow Sound

Swipr's in-house compose path renders and stores the ordered final images.
TikTok photo posts use `media_type=PHOTO`, `post_mode=DIRECT_POST`, and
`PULL_FROM_URL`.

The control “Let TikTok pick a sound” maps directly to
`post_info.auto_add_music`. It starts on and the user may turn it off. It is
shown only for a photo plus automatic posting. Video compose hides it. TikTok
finishing mode is unavailable for photos and the UI says why.
The photo request sends only photo-supported post fields. Video-only Duet and
Stitch controls are not included in the photo payload.

This is separate from ClipStitchr's private music library. No audio file is
baked into an in-house photo carousel. Instagram receives the same ordered
images as a single image or carousel.

Implementation and tests:

```text
web/app/_components/social/SocialTikTokTargetControls.tsx
web/services/provider-worker/social/tiktok/initializeTikTokPublish.ts
web/services/provider-worker/social/tiktok/initializeTikTokPublish.test.ts
web/app/_components/social/SocialTikTokTargetControls.test.tsx
```

Source: [TikTok photo-post reference](https://developers.tiktok.com/doc/content-posting-api-reference-photo-post).
