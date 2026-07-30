export function getMaxScheduledSocialPostsPerOwner() {
  const configured = Number(
    process.env.SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER ?? "500",
  );

  if (!Number.isInteger(configured) || configured < 1 || configured > 5_000) {
    throw new Error(
      "SOCIAL_MAX_SCHEDULED_POSTS_PER_OWNER must be between 1 and 5000.",
    );
  }

  return configured;
}
