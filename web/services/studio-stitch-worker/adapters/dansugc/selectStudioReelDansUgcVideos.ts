import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelCheckpointReactionSelection } from "../../contracts/StudioReelCheckpointReactionSelection";
import type { StudioReelDansUgcVideo } from "../../contracts/StudioReelDansUgcVideo";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { getStudioReelReactionSources } from "../../runtime/getStudioReelReactionSources";
import { compareStudioReelDansUgcVideos } from "./compareStudioReelDansUgcVideos";

export function selectStudioReelDansUgcVideos(
  recipe: StudioStitchRecipeV1,
  videos: readonly StudioReelDansUgcVideo[],
): readonly StudioReelCheckpointReactionSelection[] {
  const sources = getStudioReelReactionSources(recipe);
  const byModel = new Map<string, StudioReelDansUgcVideo[]>();
  for (const video of videos) {
    const entries = byModel.get(video.modelId) ?? [];
    if (!entries.some((candidate) => candidate.id === video.id)) {
      entries.push(video);
      entries.sort(compareStudioReelDansUgcVideos);
      byModel.set(video.modelId, entries);
    }
  }
  const candidateGroups = [...byModel.entries()]
    .filter(([, entries]) => entries.length >= sources.length)
    .sort((left, right) => {
      const score = compareStudioReelDansUgcVideos(left[1][0], right[1][0]);
      return score || left[0].localeCompare(right[0]);
    });
  const selected = candidateGroups[0]?.[1];
  if (!selected || sources.length < 1) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_REACTION_COVERAGE_UNAVAILABLE",
      kind: "permanent",
      publicMessage:
        "DanSUGC has no single-creator reaction set for this frozen recipe.",
    });
  }
  return sources.map((source, index) => ({
    modelId: selected[index].modelId,
    price: selected[index].price,
    recipeId: recipe.id,
    source,
    title: selected[index].title,
    videoId: selected[index].id,
  }));
}
