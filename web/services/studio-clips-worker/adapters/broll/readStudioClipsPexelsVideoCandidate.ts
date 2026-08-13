export function readStudioClipsPexelsVideoCandidate(
  video: unknown,
): URL | undefined {
  if (!video || typeof video !== "object" || Array.isArray(video)) return;
  const files = (video as { video_files?: unknown }).video_files;
  if (!Array.isArray(files)) return;
  let selectedHeight = -1;
  let selectedLink: string | undefined;
  for (const file of files) {
    if (!file || typeof file !== "object" || Array.isArray(file)) continue;
    const candidate = file as Record<string, unknown>;
    if (
      candidate.file_type === "video/mp4" &&
      typeof candidate.link === "string" &&
      typeof candidate.width === "number" &&
      typeof candidate.height === "number" &&
      candidate.height > candidate.width &&
      candidate.height > selectedHeight
    ) {
      selectedHeight = candidate.height;
      selectedLink = candidate.link;
    }
  }
  if (!selectedLink) return;
  const url = new URL(selectedLink);
  if (
    url.protocol === "https:" &&
    url.hostname === "videos.pexels.com" &&
    !url.username &&
    !url.password &&
    !url.port
  ) {
    return url;
  }
}
