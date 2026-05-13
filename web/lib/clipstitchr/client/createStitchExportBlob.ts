import { downloadBlobFromR2 } from "@/lib/clipstitchr/client/r2/downloadBlobFromR2";
import { renderCliprVideoWithMusic } from "@/lib/clipstitchr/media/renderCliprVideoWithMusic";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export async function createStitchExportBlob(stitch: Stitch) {
  const music = stitch.music;

  if (!music?.enabled) {
    return stitch.blob;
  }

  return (
    await renderCliprVideoWithMusic({
      musicBlob: await downloadBlobFromR2(music.audioObject),
      videoBlob: stitch.blob,
      volume: music.volume,
    })
  ).blob;
}
