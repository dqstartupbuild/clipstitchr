import type { StudioReelWorkerAssetManifest } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerAssetManifest";
import type { StudioStitchAssetRef } from "../../lib/clipstitchr/types/studioStitch/StudioStitchAssetRef";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { assertStudioReelWorkerOwnedObjectKey } from "./assertStudioReelWorkerOwnedObjectKey";

export async function resolveStudioReelWorkerAsset(
  ctx: MutationCtx | QueryCtx,
  input: {
    ownerId: string;
    productId: string;
    source: StudioStitchAssetRef;
  },
): Promise<StudioReelWorkerAssetManifest> {
  const source = input.source;
  if (source.kind === "videoClip") {
    const clip = await ctx.db
      .query("videoClipCards")
      .withIndex("by_owner_id", (query) =>
        query
          .eq("ownerId", input.ownerId)
          .eq("id", source.videoClipId),
      )
      .unique();
    if (!clip || clip.productId !== input.productId) {
      throw new Error("Studio Stitch video source is outside this Product.");
    }
    return {
      source,
      objectKey: assertStudioReelWorkerOwnedObjectKey(
        input.ownerId,
        clip.videoObject.key,
      ),
      contentType: clip.videoObject.contentType,
      sizeBytes: clip.videoObject.size,
      durationSeconds: clip.duration,
      width: clip.width,
      height: clip.height,
      hasAudio: clip.hasAudio,
    };
  }
  if (source.kind === "stitch") {
    const stitch = await ctx.db
      .query("stitchCards")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", input.ownerId).eq("id", source.stitchId),
      )
      .unique();
    if (
      !stitch ||
      stitch.productId !== input.productId ||
      !stitch.stitchObject
    ) {
      throw new Error("Studio Stitch source is outside this Product.");
    }
    return {
      source,
      objectKey: assertStudioReelWorkerOwnedObjectKey(
        input.ownerId,
        stitch.stitchObject.key,
      ),
      contentType: stitch.stitchObject.contentType,
      sizeBytes: stitch.stitchObject.size,
      durationSeconds: stitch.duration,
      width: stitch.width,
      height: stitch.height,
      hasAudio:
        (stitch.includeDemoAudio ?? true) ||
        (stitch.includeUgcAudio ?? true) ||
        Boolean(stitch.music),
    };
  }
  if (source.kind === "studioOutput") {
    const output = await ctx.db
      .query("studioReelOutputs")
      .withIndex("by_owner_product_id", (query) =>
        query
          .eq("ownerId", input.ownerId)
          .eq("productId", input.productId)
          .eq("id", source.outputId),
      )
      .unique();
    if (!output || !["generated", "accepted"].includes(output.status)) {
      throw new Error("Studio output source is outside this Product.");
    }
    return {
      source,
      objectKey: assertStudioReelWorkerOwnedObjectKey(
        input.ownerId,
        output.objectKey,
      ),
      contentType: output.contentType,
      sizeBytes: output.byteLength,
      durationSeconds: output.durationSeconds,
      ...(output.width ? { width: output.width } : {}),
      ...(output.height ? { height: output.height } : {}),
      ...(output.hasAudio !== undefined ? { hasAudio: output.hasAudio } : {}),
      ...(output.sha256 ? { sha256: output.sha256 } : {}),
      ...(output.objectVersion ? { objectVersion: output.objectVersion } : {}),
    };
  }

  const tracks = await ctx.db
    .query("sharedMusicTracks")
    .withIndex("by_uploaded_owner_created", (query) =>
      query.eq("uploadedByOwnerId", input.ownerId),
    )
    .order("desc")
    .take(200);
  const track = tracks.find(
    (candidate) =>
      candidate.ownerAudioObject?.key === source.objectKey,
  );
  if (!track) {
    throw new Error("Studio upload source has no owned durable record.");
  }
  const object = track.ownerAudioObject;
  if (!object) {
    throw new Error("Studio upload source is not in its owner namespace.");
  }
  return {
    source,
    objectKey: assertStudioReelWorkerOwnedObjectKey(input.ownerId, object.key),
    contentType: object.contentType,
    sizeBytes: object.size,
    durationSeconds: track.durationSeconds,
    hasAudio: true,
  };
}
