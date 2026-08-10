import type { SocialPublishingPost } from "@/lib/clipstitchr/types/SocialPublishingPost";

export function getSocialPublishingPostTimeLabel(post: SocialPublishingPost) {
  const scheduledTimestamp =
    typeof post.scheduled_at === "string"
      ? Date.parse(post.scheduled_at)
      : Number.NaN;
  const fallbackTimestamp = Date.parse(post.created_at);
  const updatedTimestamp = Date.parse(post.updated_at);
  const timestamp = Number.isFinite(scheduledTimestamp)
    ? scheduledTimestamp
    : Number.isFinite(fallbackTimestamp)
      ? fallbackTimestamp
      : updatedTimestamp;

  if (!Number.isFinite(timestamp)) {
    return "No time available";
  }

  const label = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));

  if (Number.isFinite(scheduledTimestamp)) {
    return `Scheduled ${label}`;
  }

  if (post.status === "posted") {
    return `Posted ${label}`;
  }

  if (post.status === "processing") {
    return `Sent ${label}`;
  }

  if (post.status === "failed") {
    return `Updated ${label}`;
  }

  return `Created ${label}`;
}
