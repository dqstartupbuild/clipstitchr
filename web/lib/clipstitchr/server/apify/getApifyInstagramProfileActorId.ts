export function getApifyInstagramProfileActorId() {
  const actorId = process.env.APIFY_INSTAGRAM_PROFILE_ACTOR_ID?.trim();

  if (!actorId) {
    throw new Error("Instagram manual analytics sync is not set up yet.");
  }

  return actorId;
}
