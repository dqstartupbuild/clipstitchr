import {
  CREATED_VIDEOS_STORE_NAME,
  PHOTO_ASSETS_STORE_NAME,
  VIDEO_CLIPS_STORE_NAME,
} from "@/lib/clipr/constants/objectStoreNames";

export function upgradeCliprDatabase(database: IDBDatabase) {
  if (!database.objectStoreNames.contains(VIDEO_CLIPS_STORE_NAME)) {
    const store = database.createObjectStore(VIDEO_CLIPS_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("clipType", "clipType", { unique: false });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(CREATED_VIDEOS_STORE_NAME)) {
    const store = database.createObjectStore(CREATED_VIDEOS_STORE_NAME, {
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
