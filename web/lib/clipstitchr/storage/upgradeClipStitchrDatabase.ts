import {
  PHOTO_ASSETS_STORE_NAME,
  STITCHES_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";

export function upgradeClipStitchrDatabase(database: IDBDatabase) {
  if (!database.objectStoreNames.contains(VIDEO_CLIPS_STORE_NAME)) {
    const store = database.createObjectStore(VIDEO_CLIPS_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("clipType", "clipType", { unique: false });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(STITCHES_STORE_NAME)) {
    const store = database.createObjectStore(STITCHES_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(PHOTO_ASSETS_STORE_NAME)) {
    const store = database.createObjectStore(PHOTO_ASSETS_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }
}
