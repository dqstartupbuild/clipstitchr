import type { PhotoAsset } from "@/lib/clipstitchr/types/PhotoAsset";

export type PhotoAssetMetadata = Omit<PhotoAsset, "blob" | "originalBlob">;
