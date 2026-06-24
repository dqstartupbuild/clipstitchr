const youtubeVideoIdPattern = /^[a-zA-Z0-9_-]{6,}$/;

function getYouTubeVideoId(url: URL) {
  const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (hostname === "youtu.be") {
    return pathParts[0];
  }

  if (hostname !== "youtube.com" && hostname !== "m.youtube.com") {
    return null;
  }

  if (pathParts[0] === "embed" || pathParts[0] === "shorts") {
    return pathParts[1];
  }

  if (pathParts.length === 0 || pathParts[0] === "watch") {
    return url.searchParams.get("v");
  }

  return null;
}

export function getYouTubeEmbedUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  const videoId = getYouTubeVideoId(url);

  if (!videoId || !youtubeVideoIdPattern.test(videoId)) {
    return null;
  }

  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );
  const start = url.searchParams.get("start");

  if (start && /^\d+$/.test(start)) {
    embedUrl.searchParams.set("start", start);
  }

  return embedUrl.toString();
}
