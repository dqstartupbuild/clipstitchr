export function createApifyActorRunStatusUrl(runId: string, token: string) {
  const normalizedRunId = runId.trim();
  const normalizedToken = token.trim();

  if (!normalizedRunId || !normalizedToken) {
    throw new Error("Apify run ID and API token are required.");
  }

  const url = new URL(
    `https://api.apify.com/v2/actor-runs/${encodeURIComponent(normalizedRunId)}`,
  );

  url.searchParams.set("token", normalizedToken);

  return url.toString();
}
