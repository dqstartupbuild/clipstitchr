import { CLIPR_DATABASE_NAME } from "@/lib/clipr/constants/databaseName";
import { CLIPR_DATABASE_VERSION } from "@/lib/clipr/constants/databaseVersion";
import { upgradeCliprDatabase } from "@/lib/clipr/storage/upgradeCliprDatabase";

export function openCliprDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this browser."));
      return;
    }

    const request = indexedDB.open(CLIPR_DATABASE_NAME, CLIPR_DATABASE_VERSION);
    request.onupgradeneeded = () => upgradeCliprDatabase(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
