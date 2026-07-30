export function getSocialAnalyticsApifyActorId() {
  return (
    process.env.SOCIAL_ANALYTICS_TIKTOK_APIFY_ACTOR_ID?.trim() ||
    "clockworks/tiktok-scraper"
  );
}
