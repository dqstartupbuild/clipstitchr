import { STUDIO_CLIPS_LIMITS } from "../../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { writeStudioClipsBrollResponse } from "./writeStudioClipsBrollResponse";

export async function downloadStudioClipsPexelsVideo(input: {
  fetch: typeof fetch;
  outputPath: string;
  url: URL;
}): Promise<number> {
  let url = input.url;
  for (let redirectCount = 0; redirectCount <= 3; redirectCount += 1) {
    const response = await input.fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(120_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirectCount === 3) break;
      const next = new URL(location, url);
      if (
        next.protocol !== "https:" ||
        next.hostname !== "videos.pexels.com" ||
        next.username ||
        next.password ||
        next.port
      ) {
        throw new StudioClipsWorkerError({
          code: "UNSAFE_BROLL_REDIRECT",
          kind: "permanent",
          publicMessage: "The B-roll provider returned an unsafe download redirect.",
        });
      }
      url = next;
      continue;
    }
    if (
      !response.ok ||
      response.headers.get("content-type")?.split(";")[0] !== "video/mp4"
    ) {
      throw new StudioClipsWorkerError({
        code: "BROLL_DOWNLOAD_FAILED",
        kind:
          response.status === 429 || response.status >= 500
            ? "retryable"
            : "permanent",
        publicMessage: "The B-roll provider could not return a supported video.",
      });
    }
    return writeStudioClipsBrollResponse({
      body: response.body,
      maximumBytes: STUDIO_CLIPS_LIMITS.brollArtifactSizeBytes,
      outputPath: input.outputPath,
    });
  }
  throw new StudioClipsWorkerError({
    code: "BROLL_REDIRECT_LIMIT",
    kind: "permanent",
    publicMessage: "The B-roll provider exceeded its redirect limit.",
  });
}
