import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function throwStudioClipsInvalidYouTubeUrl(): never {
  throw new StudioClipsWorkerError({
    code: "INVALID_YOUTUBE_URL",
    kind: "permanent",
    publicMessage: "The source must be a supported HTTPS YouTube video URL.",
  });
}
