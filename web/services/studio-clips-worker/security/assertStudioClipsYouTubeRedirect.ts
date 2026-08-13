import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { readStudioClipsYouTubeUrl } from "./readStudioClipsYouTubeUrl";

export function assertStudioClipsYouTubeRedirect(input: {
  fromUrl: string;
  redirectCount: number;
  toUrl: string;
}): URL {
  if (
    !Number.isInteger(input.redirectCount) ||
    input.redirectCount < 1 ||
    input.redirectCount > STUDIO_CLIPS_LIMITS.redirectCount
  ) {
    throw new StudioClipsWorkerError({
      code: "YOUTUBE_REDIRECT_REJECTED",
      kind: "permanent",
      publicMessage: "The YouTube redirect limit was exceeded.",
    });
  }

  const from = readStudioClipsYouTubeUrl(input.fromUrl);
  const to = readStudioClipsYouTubeUrl(input.toUrl);

  if (from.videoId !== to.videoId) {
    throw new StudioClipsWorkerError({
      code: "YOUTUBE_REDIRECT_REJECTED",
      kind: "permanent",
      publicMessage: "The YouTube redirect changed the requested video.",
    });
  }

  return to.url;
}
