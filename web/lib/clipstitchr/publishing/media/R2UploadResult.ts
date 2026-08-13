import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

export type R2UploadResult = R2ObjectReference & {
  etag?: string;
  versionId?: string;
};
