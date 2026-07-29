type R2EndpointEnvironment = Record<string, string | undefined> & {
  R2_ENDPOINT?: string;
  R2_ACCOUNT_ID?: string;
};

export function resolveR2Endpoint(environment: R2EndpointEnvironment) {
  const configuredEndpoint = environment.R2_ENDPOINT?.trim();
  const accountId = environment.R2_ACCOUNT_ID?.trim();
  const endpoint =
    configuredEndpoint ||
    (accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : undefined);

  if (!endpoint) {
    throw new Error("Missing R2_ENDPOINT.");
  }

  let url: URL;

  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("R2_ENDPOINT must be a valid HTTPS URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("R2_ENDPOINT must be a valid HTTPS URL.");
  }

  return url.origin;
}
