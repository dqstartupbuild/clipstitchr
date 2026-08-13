import type { StudioReelDansUgcVideo } from "../../contracts/StudioReelDansUgcVideo";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function readStudioReelDansUgcVideos(
  payload: Record<string, unknown>,
): readonly StudioReelDansUgcVideo[] {
  if (!Array.isArray(payload.videos) || payload.videos.length > 100) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_SEARCH_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC returned an invalid reaction search.",
    });
  }
  return payload.videos.map((value) => {
    const video = value as Record<string, unknown>;
    const model = video?.model as Record<string, unknown> | undefined;
    if (
      !video ||
      Array.isArray(video) ||
      typeof video !== "object" ||
      typeof video.id !== "string" ||
      video.id.length < 1 ||
      video.id.length > 240 ||
      typeof video.title !== "string" ||
      video.title.length > 500 ||
      typeof video.price !== "number" ||
      !Number.isFinite(video.price) ||
      video.price < 0 ||
      typeof video.virality_score !== "number" ||
      !Number.isFinite(video.virality_score) ||
      !model ||
      typeof model.id !== "string" ||
      model.id.length < 1 ||
      model.id.length > 240 ||
      (video.similarity !== undefined &&
        (typeof video.similarity !== "number" ||
          !Number.isFinite(video.similarity)))
    ) {
      throw new StudioReelWorkerError({
        code: "DANSUGC_SEARCH_INVALID",
        kind: "permanent",
        publicMessage: "DanSUGC returned an invalid reaction search.",
      });
    }
    return {
      id: video.id,
      modelId: model.id,
      price: video.price,
      similarity:
        typeof video.similarity === "number" ? video.similarity : null,
      title: video.title,
      viralityScore: video.virality_score,
    };
  });
}
