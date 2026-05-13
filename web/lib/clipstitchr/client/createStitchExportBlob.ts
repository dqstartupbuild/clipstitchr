import { downloadMusicBlob } from "@/lib/clipstitchr/client/r2/downloadMusicBlob";
import { renderCliprVideoWithMusic } from "@/lib/clipstitchr/media/renderCliprVideoWithMusic";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";

export async function createStitchExportBlob(stitch: Stitch) {
  const music = stitch.music;

  if (!music?.enabled) {
    return stitch.blob;
  }

  return (
    await renderCliprVideoWithMusic({
      musicBlob: await downloadMusicBlob(music),
      videoBlob: stitch.blob,
      volume: music.volume,
    })
  ).blob;
}
