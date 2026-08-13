import type { StudioClipsCreateRequest } from "@/lib/clipstitchr/types/studioClips/StudioClipsCreateRequest";
import type { StudioClipsCreateDraft } from "./StudioClipsCreateDraft";
import type { StudioClipsTaskSource } from "./StudioClipsTaskSource";
import { createStudioClipsIdempotencyKey } from "./createStudioClipsIdempotencyKey";

export function createStudioClipsCreateRequest(
  productId: string,
  source: StudioClipsTaskSource,
  draft: StudioClipsCreateDraft,
  customFontObjectKey?: string,
): StudioClipsCreateRequest {
  return {
    idempotencyKey: createStudioClipsIdempotencyKey("create"),
    options: {
      ...draft.options,
      captionStyle: {
        fontColorHex: draft.style.fontColor,
        fontFamily: draft.style.fontFamily,
        fontSizePx: draft.style.fontSizePx,
        templateId: draft.style.captionTemplate,
        ...(customFontObjectKey ? { customFontObjectKey } : {}),
      },
    },
    productId,
    schemaVersion: "studio-clips-create-v1",
    source,
  };
}
