export async function readCliJsonObject(request: Request) {
  const body = (await request.json()) as unknown;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Send a JSON object.");
  }

  return body as Record<string, unknown>;
}
