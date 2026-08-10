export function normalizeSocialPublishingTitle(value: string, fallback: string) {
  const title = value.trim() || fallback.trim() || "ClipStitchr post";

  return title.slice(0, 100);
}
