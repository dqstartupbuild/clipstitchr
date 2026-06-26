import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type UploadSharedMusicTrackOptions = {
  durationSeconds: number;
  file: File;
  source: MusicTrackSource;
  title: string;
};

export async function uploadSharedMusicTrack({
  durationSeconds,
  file,
  source,
  title,
}: UploadSharedMusicTrackOptions) {
  const formData = new FormData();

  formData.set("durationSeconds", String(durationSeconds));
  formData.set("file", file);
  formData.set("source", source);
  formData.set("title", title);

  const response = await fetch("/api/music/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to upload sound.");
  }

  return ((await response.json()) as { track: SharedMusicTrack }).track;
}
