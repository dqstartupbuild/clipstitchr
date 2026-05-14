import { renderSavedStitchBlob } from "@/lib/clipstitchr/client/renderSavedStitchBlob";
import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { renderCliprVideoWithMusic } from "@/lib/clipstitchr/media/renderCliprVideoWithMusic";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";

type CreateStitchExportBlobOptions = {
  loadClip?: (id: string) => Promise<VideoClip | null>;
  onProgress?: (progress: number) => void;
};

async function createBaseStitchExportBlob(
  stitch: Stitch,
  { loadClip, onProgress }: CreateStitchExportBlobOptions,
) {
  if (loadClip) {
    try {
      return await renderSavedStitchBlob({ loadClip, onProgress, stitch });
    } catch (error) {
      if (!stitch.blob && !stitch.stitchObject) {
        throw error;
      }
    }
  }

  if (stitch.blob) {
    return stitch.blob;
  }

  if (stitch.stitchObject) {
    return await downloadBlobFromR2(stitch.stitchObject);
  }

  throw new Error("Unable to load the source videos for this stitch.");
}

export async function createStitchExportBlob(
  stitch: Stitch,
  options: CreateStitchExportBlobOptions = {},
) {
  const music = stitch.music;
  const baseBlob = await createBaseStitchExportBlob(stitch, options);

  if (!music?.enabled) {
    return baseBlob;
  }

  return (
    await renderCliprVideoWithMusic({
      musicBlob: await downloadMusicBlob(music),
      videoBlob: baseBlob,
      volume: music.volume,
    })
  ).blob;
}
