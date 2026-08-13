import { randomUUID } from "node:crypto";
import { createUserR2KeyPrefix } from "@/lib/clipstitchr/server/r2/createUserR2KeyPrefix";
import { getMimeTypeFileExtension } from "@/lib/clipstitchr/utils/getMimeTypeFileExtension";
import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

const fallbackExtensions: Record<StudioBetaR2ObjectKind, string> = {
  caption: "txt",
  font: "ttf",
  "media-output": "mp4",
  "media-source": "mp4",
  poster: "jpg",
  project: "json",
  "research-artifact": "json",
};

type CreateStudioBetaR2ObjectKeyInput = {
  contentType: string;
  kind: StudioBetaR2ObjectKind;
  productId: string;
  recordId: string;
  userId: string;
};

export function createStudioBetaR2ObjectKey(
  input: CreateStudioBetaR2ObjectKeyInput,
) {
  const extension = getMimeTypeFileExtension(
    input.contentType,
    fallbackExtensions[input.kind],
  );

  return [
    createUserR2KeyPrefix(input.userId).replace(/\/$/, ""),
    "studio",
    "v1",
    input.kind,
    input.productId,
    input.recordId,
    `${randomUUID()}.${extension}`,
  ].join("/");
}
