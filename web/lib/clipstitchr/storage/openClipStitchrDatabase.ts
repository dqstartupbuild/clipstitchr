import { CLIPSTITCHR_DATABASE_NAME } from "@/lib/clipstitchr/constants/databaseName";
import { CLIPSTITCHR_DATABASE_VERSION } from "@/lib/clipstitchr/constants/databaseVersion";
import { upgradeClipStitchrDatabase } from "@/lib/clipstitchr/storage/upgradeClipStitchrDatabase";

export function openClipStitchrDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(
      CLIPSTITCHR_DATABASE_NAME,
      CLIPSTITCHR_DATABASE_VERSION,
    );
    request.onupgradeneeded = (event) =>
      upgradeClipStitchrDatabase(
        request.result,
        request.transaction,
        event.oldVersion,
      );
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
