import {
  PHOTO_ASSET_BLOBS_STORE_NAME,
  PHOTO_ASSET_METADATA_STORE_NAME,
  STITCHES_STORE_NAME,
  VIDEO_CLIP_BLOBS_STORE_NAME,
  VIDEO_CLIP_METADATA_STORE_NAME,
} from "@/lib/clipstitchr/constants/objectStoreNames";
import { migratePhotoAssetsToSplitStores } from "@/lib/clipstitchr/storage/migratePhotoAssetsToSplitStores";
import { migrateVideoClipsToSplitStores } from "@/lib/clipstitchr/storage/migrateVideoClipsToSplitStores";

export function upgradeClipStitchrDatabase(
  database: IDBDatabase,
  transaction: IDBTransaction | null,
  oldVersion: number,
) {
  if (
    !database.objectStoreNames.contains(VIDEO_CLIP_METADATA_STORE_NAME)
  ) {
    const store = database.createObjectStore(VIDEO_CLIP_METADATA_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("clipType", "clipType", { unique: false });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(VIDEO_CLIP_BLOBS_STORE_NAME)) {
    database.createObjectStore(VIDEO_CLIP_BLOBS_STORE_NAME, {
      keyPath: "id",
    });
  }

  if (!database.objectStoreNames.contains(STITCHES_STORE_NAME)) {
    const store = database.createObjectStore(STITCHES_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(PHOTO_ASSET_METADATA_STORE_NAME)) {
    const store = database.createObjectStore(PHOTO_ASSET_METADATA_STORE_NAME, {
      keyPath: "id",
    });
    store.createIndex("createdAt", "createdAt", { unique: false });
  }

  if (!database.objectStoreNames.contains(PHOTO_ASSET_BLOBS_STORE_NAME)) {
    database.createObjectStore(PHOTO_ASSET_BLOBS_STORE_NAME, {
      keyPath: "id",
    });
  }

  if (transaction && oldVersion < 4) {
    migrateVideoClipsToSplitStores(database, transaction);
    migratePhotoAssetsToSplitStores(database, transaction);
  }
}
