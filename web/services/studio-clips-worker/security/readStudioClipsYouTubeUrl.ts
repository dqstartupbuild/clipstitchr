import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { throwStudioClipsInvalidYouTubeUrl } from "./throwStudioClipsInvalidYouTubeUrl";

const allowedHosts = new Set([
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube.com",
  "youtu.be",
  "youtube.com",
]);
const allowedQueryNames = new Set([
  "feature",
  "index",
  "list",
  "si",
  "start",
  "t",
  "v",
]);
const videoIdPattern = /^[A-Za-z0-9_-]{11}$/;

export function readStudioClipsYouTubeUrl(value: string): {
  url: URL;
  videoId: string;
} {
  if (
    typeof value !== "string" ||
    value.length < 1 ||
    value.length > STUDIO_CLIPS_LIMITS.urlCharacters
  ) {
    return throwStudioClipsInvalidYouTubeUrl();
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return throwStudioClipsInvalidYouTubeUrl();
  }

  if (
    url.protocol !== "https:" ||
    !allowedHosts.has(url.hostname) ||
    url.port !== "" ||
    url.username !== "" ||
    url.password !== "" ||
    url.hash !== ""
  ) {
    return throwStudioClipsInvalidYouTubeUrl();
  }

  const queryNames: string[] = [];
  for (const key of url.searchParams.keys()) queryNames.push(key.toLowerCase());

  let unsupportedQuery = false;
  for (const key of queryNames) {
    if (!allowedQueryNames.has(key)) unsupportedQuery = true;
  }
  if (
    unsupportedQuery ||
    new Set(queryNames).size !== queryNames.length ||
    (url.pathname !== "/watch" && queryNames.includes("v"))
  ) {
    return throwStudioClipsInvalidYouTubeUrl();
  }

  let videoId: string | undefined;

  if (url.hostname === "youtu.be") {
    const segments = url.pathname.split("/").filter(Boolean);
    videoId = segments.length === 1 ? segments[0] : undefined;
  } else if (url.pathname === "/watch") {
    const values = url.searchParams.getAll("v");
    videoId = values.length === 1 ? values[0] : undefined;
  } else {
    const match = url.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)$/);
    videoId = match?.[1];
  }

  if (!videoId || !videoIdPattern.test(videoId)) {
    return throwStudioClipsInvalidYouTubeUrl();
  }

  return {
    url: new URL(`https://www.youtube.com/watch?v=${videoId}`),
    videoId,
  };
}
