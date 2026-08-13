import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsYouTubeNavigationPolicy } from "../contracts/StudioClipsYouTubeNavigationPolicy";
import { assertStudioClipsYouTubeRedirect } from "./assertStudioClipsYouTubeRedirect";
import { readStudioClipsYouTubeUrl } from "./readStudioClipsYouTubeUrl";

export const studioClipsYouTubeNavigationPolicy: StudioClipsYouTubeNavigationPolicy =
  Object.freeze({
    assertRedirect: assertStudioClipsYouTubeRedirect,
    maxRedirects: STUDIO_CLIPS_LIMITS.redirectCount,
    readUrl: (value: string) => readStudioClipsYouTubeUrl(value).url,
  });
