# Clear ClipStitchr IndexedDB

ClipStitchr stores normalized clips, created stitched videos, generated poster
images, thumbnails, and related metadata in browser IndexedDB during the MVP.
Clip/photo metadata is split from full media blobs so library pages can render
without reading every large video or photo blob. Poster records include a
capture-version marker so older or stale posters can be regenerated when the
library loads.

To clear the local library, open ClipStitchr in the browser, open DevTools Console, and
run:

```js
indexedDB.deleteDatabase("clipstitchr-mvp");
```

Then refresh the page.

If deletion is blocked, close other ClipStitchr tabs and retry:

```js
const request = indexedDB.deleteDatabase("clipstitchr-mvp");

request.onsuccess = () => console.log("ClipStitchr IndexedDB cleared");
request.onerror = () => console.error(request.error);
request.onblocked = () => console.warn("Close other ClipStitchr tabs, then retry");
```

IndexedDB is scoped by origin, including port. For example,
`http://localhost:3000` and `http://localhost:3001` have separate databases, so
clear it from the same URL where you used the app.
