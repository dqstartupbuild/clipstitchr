import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";
import { assertStudioBetaJsonExactKeys } from "@/lib/clipstitchr/server/studio/http/assertStudioBetaJsonExactKeys";
import { readStudioBetaBoundedJsonObject } from "@/lib/clipstitchr/server/studio/http/readStudioBetaBoundedJsonObject";
import { getStudioBetaR2ContentTypeIsAllowed } from "./getStudioBetaR2ContentTypeIsAllowed";
import { getStudioBetaR2UploadMaxBytes } from "./getStudioBetaR2UploadMaxBytes";

const studioBetaR2ObjectKinds = new Set<StudioBetaR2ObjectKind>([
  "research-artifact",
  "media-source",
  "project",
  "media-output",
  "poster",
  "caption",
  "font",
]);

type StudioBetaR2UploadUrlRequest = {
  contentType: string;
  kind: StudioBetaR2ObjectKind;
  productId: string;
  recordId: string;
  sizeBytes: number;
};

export async function readStudioBetaR2UploadUrlRequest(
  request: Request,
): Promise<StudioBetaR2UploadUrlRequest> {
  const body = await readStudioBetaBoundedJsonObject(request);
  assertStudioBetaJsonExactKeys(body, [
    "contentType",
    "kind",
    "productId",
    "recordId",
    "sizeBytes",
  ]);
  const input = body as Partial<StudioBetaR2UploadUrlRequest>;

  if (!input.kind || !studioBetaR2ObjectKinds.has(input.kind)) {
    throw new Error("Choose a supported Studio file type.");
  }

  if (
    typeof input.productId !== "string" ||
    input.productId.length === 0 ||
    input.productId.length > 128 ||
    !/^[A-Za-z0-9_-]+$/.test(input.productId)
  ) {
    throw new Error("Choose an active Product for this Studio file.");
  }

  if (
    typeof input.recordId !== "string" ||
    input.recordId.length === 0 ||
    input.recordId.length > 128 ||
    !/^[A-Za-z0-9_-]+$/.test(input.recordId)
  ) {
    throw new Error("The Studio record ID is invalid.");
  }

  if (
    typeof input.contentType !== "string" ||
    !getStudioBetaR2ContentTypeIsAllowed(input.kind, input.contentType)
  ) {
    throw new Error("That file format is not supported here.");
  }

  if (
    typeof input.sizeBytes !== "number" ||
    !Number.isFinite(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > getStudioBetaR2UploadMaxBytes(input.kind)
  ) {
    throw new Error("That file is too large for this Studio upload.");
  }

  return {
    contentType: input.contentType.toLowerCase().split(";", 1)[0],
    kind: input.kind,
    productId: input.productId,
    recordId: input.recordId,
    sizeBytes: Math.ceil(input.sizeBytes),
  };
}
