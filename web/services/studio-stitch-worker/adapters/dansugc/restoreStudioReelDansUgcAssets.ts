import { join } from "node:path";
import type { StudioReelCheckpointReactionAsset } from "../../contracts/StudioReelCheckpointReactionAsset";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelWorkerR2ObjectStore } from "../../contracts/StudioReelWorkerR2ObjectStore";
import { probeStudioReelSource } from "../media/probeStudioReelSource";

export async function restoreStudioReelDansUgcAssets(input: {
  readonly assets: readonly StudioReelCheckpointReactionAsset[];
  readonly ffprobePath: string;
  readonly objects: StudioReelWorkerR2ObjectStore;
  readonly ownerId: string;
  readonly runner: StudioReelCommandRunner;
  readonly workspacePath: string;
}) {
  const restored = [];
  for (let index = 0; index < input.assets.length; index += 1) {
    const asset = input.assets[index];
    const localPath = join(
      input.workspacePath,
      `dansugc-restored-${String(index + 1).padStart(3, "0")}.mp4`,
    );
    const manifest = {
      contentType: asset.contentType,
      durationSeconds: asset.durationSeconds,
      hasAudio: asset.hasAudio,
      height: asset.height,
      objectKey: asset.objectKey,
      objectVersion: asset.objectVersion,
      sha256: asset.sha256,
      sizeBytes: asset.sizeBytes,
      source: asset.source,
      width: asset.width,
    };
    await input.objects.downloadFile({
      manifest,
      maximumBytes: asset.sizeBytes,
      outputPath: localPath,
      ownerId: input.ownerId,
    });
    await probeStudioReelSource({
      ffprobePath: input.ffprobePath,
      localPath,
      manifest,
      runner: input.runner,
      workspacePath: input.workspacePath,
    });
    restored.push({ localPath, manifest });
  }
  return restored;
}
