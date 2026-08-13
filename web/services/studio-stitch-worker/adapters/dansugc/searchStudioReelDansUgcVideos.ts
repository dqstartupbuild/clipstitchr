import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import { readStudioReelProviderJson } from "../providers/readStudioReelProviderJson";
import { fetchStudioReelDansUgc } from "./fetchStudioReelDansUgc";
import { readStudioReelDansUgcVideos } from "./readStudioReelDansUgcVideos";

export async function searchStudioReelDansUgcVideos(input: {
  readonly apiKey: string;
  readonly fetch?: typeof fetch;
  readonly recipe: StudioStitchRecipeV1;
}) {
  const semanticSearch = [
    input.recipe.grounding.productName,
    input.recipe.hook.family,
    input.recipe.hook.text,
    "authentic human reaction",
  ]
    .join(" ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 500);
  const search = new URLSearchParams({
    limit: "100",
    media_type: "video",
    semantic_search: semanticSearch,
    sort_by: "virality_score",
    sort_order: "desc",
  });
  const response = await fetchStudioReelDansUgc({
    apiKey: input.apiKey,
    fetch: input.fetch,
    path: "/broll",
    search,
  });
  return readStudioReelDansUgcVideos(
    await readStudioReelProviderJson(response, "DanSUGC", 2 * 1024 * 1024),
  );
}
