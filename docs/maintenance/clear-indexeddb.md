# Clear Clipr IndexedDB

Clipr stores normalized clips, created stitched videos, generated poster images,
and related metadata in browser IndexedDB during the MVP. Poster records include
a capture-version marker so older or stale posters can be regenerated when the
library loads.

To clear the local library, open Clipr in the browser, open DevTools Console, and
run:

```js
indexedDB.deleteDatabase("clipr-mvp");
```

Then refresh the page.

If deletion is blocked, close other Clipr tabs and retry:

```js
const request = indexedDB.deleteDatabase("clipr-mvp");

request.onsuccess = () => console.log("Clipr IndexedDB cleared");
request.onerror = () => console.error(request.error);
request.onblocked = () => console.warn("Close other Clipr tabs, then retry");
```

IndexedDB is scoped by origin, including port. For example,
`http://localhost:3000` and `http://localhost:3001` have separate databases, so
clear it from the same URL where you used the app.
