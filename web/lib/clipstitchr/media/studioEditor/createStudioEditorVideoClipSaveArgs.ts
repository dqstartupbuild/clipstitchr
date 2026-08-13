import { VIDEO_POSTER_CAPTURE_VERSION } from "@/lib/clipstitchr/constants/videoPosterCaptureVersion";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { StudioEditorExportResult } from "@/lib/clipstitchr/types/StudioEditorExportResult";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";

type CreateStudioEditorVideoClipSaveArgsOptions = {
  clipId: string;
  exported: StudioEditorExportResult;
  posterObject: R2ObjectReference;
  productId: string;
  project: StudioEditorProjectV1;
  updatedAt: string;
  videoObject: R2ObjectReference;
};

export function createStudioEditorVideoClipSaveArgs({
  clipId,
  exported,
  posterObject,
  productId,
  project,
  updatedAt,
  videoObject,
}: CreateStudioEditorVideoClipSaveArgsOptions) {
  const name = `${project.name} - Studio edit`;

  return {
    id: clipId,
    name,
    tags: normalizeAssetTagsWithRequiredTag(["studio-editor"], "ugc"),
    videoDescription: "A finished edit saved from Studio.",
    productId,
    originalName: `${project.name.replace(/[^A-Za-z0-9_-]+/g, "-") || "studio-edit"}.mp4`,
    clipType: "ugc" as const,
    videoObject,
    posterObject,
    posterVersion: VIDEO_POSTER_CAPTURE_VERSION,
    mimeType: exported.mimeType,
    sourceMimeType: exported.mimeType,
    size: videoObject.size,
    originalSize: videoObject.size,
    width: exported.width,
    height: exported.height,
    aspectRatio: exported.width / exported.height,
    duration: exported.duration,
    defaultTrimRange: { start: 0, end: exported.duration },
    hasAudio: exported.hasAudio,
    createdAt: updatedAt,
    updatedAt,
  };
}
