import type { Infer } from "convex/values";
import { studioReelHandoffMetadataValidator } from "../validators/studioReelHandoffMetadata";
import { normalizeStudioReelHandoffId } from "./normalizeStudioReelHandoffId";

type StudioReelHandoffMetadata = Infer<
  typeof studioReelHandoffMetadataValidator
>;

export function normalizeStudioReelHandoffMetadata(
  handoff: StudioReelHandoffMetadata,
) {
  return {
    libraryAssetId: normalizeStudioReelHandoffId(
      handoff.libraryAssetId,
      "Library asset ID",
    ),
    editorProjectId: normalizeStudioReelHandoffId(
      handoff.editorProjectId,
      "Editor project ID",
    ),
    publishingSourceId: normalizeStudioReelHandoffId(
      handoff.publishingSourceId,
      "Publishing source ID",
    ),
  };
}
