import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";

export async function searchTikTokSounds(query: string) {
  const response = await fetch("/api/music/tiktok/search", {
    body: JSON.stringify({ query }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to find sounds.");
  }

  return ((await response.json()) as { candidates: TikTokSoundCandidate[] })
    .candidates;
}
