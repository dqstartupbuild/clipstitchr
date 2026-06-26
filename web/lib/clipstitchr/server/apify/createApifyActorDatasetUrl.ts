export function createApifyActorDatasetUrl(actorId: string, token: string) {
  const encodedActorId = actorId.replace("/", "~");
  const url = new URL(
    `https://api.apify.com/v2/acts/${encodedActorId}/run-sync-get-dataset-items`,
  );

  url.searchParams.set("token", token);
  url.searchParams.set("format", "json");
  url.searchParams.set("clean", "true");

  return url.toString();
}
