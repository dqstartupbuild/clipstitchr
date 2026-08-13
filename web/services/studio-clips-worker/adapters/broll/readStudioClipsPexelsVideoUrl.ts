import { readStudioClipsPexelsVideoCandidate } from "./readStudioClipsPexelsVideoCandidate";

export function readStudioClipsPexelsVideoUrl(
  payload: unknown,
): URL | undefined {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
  const videos = (payload as { videos?: unknown }).videos;
  if (!Array.isArray(videos)) return;
  for (const video of videos) {
    const url = readStudioClipsPexelsVideoCandidate(video);
    if (url) return url;
  }
}
