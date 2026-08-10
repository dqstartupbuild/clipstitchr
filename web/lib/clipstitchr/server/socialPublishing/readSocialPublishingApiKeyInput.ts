export async function readSocialPublishingApiKeyInput(request: Request) {
  const body = (await request.json()) as { apiKey?: unknown };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    throw new Error("Paste your Zernio API key first.");
  }

  if (!/^sk_[a-f0-9]{64}$/i.test(apiKey)) {
    throw new Error(
      "That does not look like a Zernio API key. Copy the full key from Zernio and try again.",
    );
  }

  return apiKey;
}
