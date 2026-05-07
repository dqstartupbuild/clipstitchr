# Clear Clipr IndexedDB

Clipr stores normalized clips and created stitched videos in browser IndexedDB
during the MVP.

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
