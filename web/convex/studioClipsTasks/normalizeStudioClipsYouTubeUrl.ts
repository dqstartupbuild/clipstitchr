import { throwInvalidStudioClipsYouTubeUrl } from "./throwInvalidStudioClipsYouTubeUrl";

export function normalizeStudioClipsYouTubeUrl(value: string) {
  if (value.length === 0 || value.length > 2_048) {
    return throwInvalidStudioClipsYouTubeUrl();
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return throwInvalidStudioClipsYouTubeUrl();
  }
  const hosts = new Set([
    "m.youtube.com",
    "music.youtube.com",
    "www.youtube.com",
    "youtu.be",
    "youtube.com",
  ]);
  if (
    url.protocol !== "https:" ||
    !hosts.has(url.hostname) ||
    url.port ||
    url.username ||
    url.password ||
    url.hash
  ) {
    return throwInvalidStudioClipsYouTubeUrl();
  }
  const allowedQueryNames = new Set([
    "feature",
    "index",
    "list",
    "si",
    "start",
    "t",
    "v",
  ]);
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
    return throwInvalidStudioClipsYouTubeUrl();
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
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return throwInvalidStudioClipsYouTubeUrl();
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}
