import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export async function importTikTokSound(sourceUrl: string) {
  const response = await fetch("/api/music/tiktok/import", {
    body: JSON.stringify({ sourceUrl }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to save that sound.");
  }

  return ((await response.json()) as { track: SharedMusicTrack }).track;
}
