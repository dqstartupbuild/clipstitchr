export async function readPostBridgeApiKeyInput(request: Request) {
  const body = (await request.json()) as { apiKey?: unknown };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";

  if (!apiKey) {
    throw new Error("Paste your Post Bridge API key first.");
  }

  return apiKey;
}
