import type { MusicTrackSource } from "@/lib/clipstitchr/types/MusicTrackSource";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

type GenerateSharedMusicTrackOptions = {
  source: MusicTrackSource;
  style?: string;
};

export async function generateSharedMusicTrack({
  source,
  style,
}: GenerateSharedMusicTrackOptions) {
  const response = await fetch("/api/music/generate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ source, style }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate music.");
  }

  return ((await response.json()) as { track: SharedMusicTrack }).track;
}
