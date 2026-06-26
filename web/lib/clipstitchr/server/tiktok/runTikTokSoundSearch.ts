import { runApifyActorDataset } from "@/lib/clipstitchr/server/apify/runApifyActorDataset";
import { createTikTokScraperSearchInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperSearchInput";
import { createTikTokSoundCandidates } from "@/lib/clipstitchr/server/tiktok/createTikTokSoundCandidates";
import { tiktokScraperActorId } from "@/lib/clipstitchr/server/tiktok/tiktokScraperActorId";

export async function runTikTokSoundSearch(query: string, limit: number) {
  const items = await runApifyActorDataset({
    actorId: tiktokScraperActorId,
    input: createTikTokScraperSearchInput(query, limit),
  });

  return createTikTokSoundCandidates(items);
}
