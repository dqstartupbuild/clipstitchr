export function createApifyActorRunUrl(
  actorId: string,
  token: string,
  maxTotalChargeUsd: number,
) {
  const normalizedActorId = actorId.trim();
  const normalizedToken = token.trim();

  if (!/^[a-z0-9._-]+(?:[\/~][a-z0-9._-]+)?$/i.test(normalizedActorId)) {
    throw new Error("Apify actor ID is invalid.");
  }

  if (!normalizedToken) {
    throw new Error("Apify API token is required.");
  }

  if (!Number.isFinite(maxTotalChargeUsd) || maxTotalChargeUsd <= 0) {
    throw new Error("Apify maximum charge must be greater than zero.");
  }

  const url = new URL(
    `https://api.apify.com/v2/acts/${normalizedActorId.replace("/", "~")}/runs`,
  );

  url.searchParams.set("token", normalizedToken);
  url.searchParams.set("waitForFinish", "0");
  url.searchParams.set("timeout", "180");
  url.searchParams.set("maxItems", "1");
  url.searchParams.set("maxTotalChargeUsd", String(maxTotalChargeUsd));

  return url.toString();
}
