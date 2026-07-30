# Instagram Publishing

ClipStitchr supports connected professional Business and Creator accounts.
Saved Stitch videos publish as Reels. One Swipr image publishes as an image;
two through ten publish as an image carousel.

At execution time the provider worker:

1. rechecks entitlement;
2. creates the video, image, carousel-child, and parent containers required for
   the media shape;
3. polls processing with bounded five-second backoff for at most five minutes;
4. stops on `ERROR` or `EXPIRED`;
5. rechecks entitlement immediately before `media_publish`;
6. stores the returned media ID and permalink.

Container IDs are persisted before continuation. A network loss or provider
5xx around the final `media_publish` becomes `outcome_unknown`; the final call
is not blindly repeated. Provider 429 responses and ClipStitchr's conservative
per-account, owner, and global limits defer safe work before another external
mutation.

Photos are limited to 8 MiB, videos to 300 MiB, and carousels to ten images
before a container is created.
The in-house Swipe path renders 1,080 × 1,350 JPEG photos. The scheduling
mutation validates the final image aspect ratio and the Reel container,
duration, dimensions, and file size before the post enters the queue.

Implementation lives in
`web/services/provider-worker/social/instagram/` and is based on Meta's current
[Instagram API Postman collection](https://www.postman.com/meta/instagram/overview).
The pinned version is `v25.0` unless `INSTAGRAM_GRAPH_API_VERSION` is changed
after a compatibility review.
