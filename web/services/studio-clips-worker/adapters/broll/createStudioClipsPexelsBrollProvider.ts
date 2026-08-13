import { join } from "node:path";
import type { StudioClipsBrollArtifact } from "../../contracts/StudioClipsBrollArtifact";
import type { StudioClipsPipelineState } from "../../contracts/StudioClipsPipelineState";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsWorkerRuntimeConfig } from "../../runtime/StudioClipsWorkerRuntimeConfig";
import { readStudioClipsProviderJson } from "../providers/readStudioClipsProviderJson";
import { downloadStudioClipsPexelsVideo } from "./downloadStudioClipsPexelsVideo";
import { readStudioClipsBrollOpportunities } from "./readStudioClipsBrollOpportunities";
import { readStudioClipsPexelsVideoUrl } from "./readStudioClipsPexelsVideoUrl";

export function createStudioClipsPexelsBrollProvider(input: {
  config?: StudioClipsWorkerRuntimeConfig["broll"];
  fetch?: typeof fetch;
}) {
  const request = input.fetch ?? fetch;
  return async (state: StudioClipsPipelineState, workspacePath: string): Promise<StudioClipsBrollArtifact[]> => {
    if (!input.config) {
      throw new StudioClipsWorkerError({
        code: "BROLL_PROVIDER_UNAVAILABLE",
        kind: "permanent",
        publicMessage: "B-roll is unavailable because PEXELS_API_KEY is not configured.",
      });
    }
    if (!state.analysis) {
      throw new StudioClipsWorkerError({
        code: "MISSING_ANALYSIS_STATE",
        kind: "permanent",
        publicMessage: "The B-roll stage is missing clip analysis.",
      });
    }
    const opportunities = readStudioClipsBrollOpportunities(state.analysis);
    const artifacts: StudioClipsBrollArtifact[] = [];
    for (const opportunity of opportunities) {
      const url = new URL("https://api.pexels.com/videos/search");
      url.searchParams.set("orientation", "portrait");
      url.searchParams.set("per_page", "5");
      url.searchParams.set("query", opportunity.searchTerm);
      url.searchParams.set("size", "medium");
      const payload = await readStudioClipsProviderJson(
        await request(url, {
          headers: { authorization: input.config.apiKey },
          method: "GET",
          redirect: "error",
          signal: AbortSignal.timeout(30_000),
        }),
        "Pexels",
      );
      const videoUrl = readStudioClipsPexelsVideoUrl(payload);
      if (!videoUrl) continue;
      const artifactId = `broll-${opportunity.candidateId}`;
      const localPath = join(workspacePath, `${artifactId}.mp4`);
      const sizeBytes = await downloadStudioClipsPexelsVideo({
        fetch: request,
        outputPath: localPath,
        url: videoUrl,
      });
      artifacts.push({ artifactId, contentType: "video/mp4", localPath, sizeBytes });
    }
    return artifacts;
  };
}
