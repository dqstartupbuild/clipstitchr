import { throwStudioClipsYouTubeSourceError } from "./throwStudioClipsYouTubeSourceError";

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

export function readStudioClipsYouTubeSource(value: string) {
  let url: URL;

  if (!value || value.length > 2_048) {
    return throwStudioClipsYouTubeSourceError();
  }

  try {
    url = new URL(value);
  } catch {
    return throwStudioClipsYouTubeSourceError();
  }

  if (
    url.protocol !== "https:" ||
    !allowedHosts.has(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.hash
  ) {
    return throwStudioClipsYouTubeSourceError();
  }

  const queryNames = [...url.searchParams.keys()].map((key) => key.toLowerCase());

  if (
    queryNames.some((key) => !allowedQueryNames.has(key)) ||
    new Set(queryNames).size !== queryNames.length ||
    (url.pathname !== "/watch" && queryNames.includes("v"))
  ) {
    return throwStudioClipsYouTubeSourceError();
  }

  let videoId: string | undefined;

  if (url.hostname === "youtu.be") {
    const segments = url.pathname.split("/").filter(Boolean);
    videoId = segments.length === 1 ? segments[0] : undefined;
  } else if (url.pathname === "/watch") {
    const values = url.searchParams.getAll("v");
    videoId = values.length === 1 ? values[0] : undefined;
  } else {
    videoId = url.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)$/)?.[1];
  }

  if (!videoId || !videoIdPattern.test(videoId)) {
    return throwStudioClipsYouTubeSourceError();
  }

  return {
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    videoId,
  };
}
