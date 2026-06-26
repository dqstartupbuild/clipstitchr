export async function readTikTokSoundSearchRequest(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const query = typeof body?.query === "string" ? body.query.trim() : "";

  if (!query) {
    throw new Error("Search for a niche, mood, or product.");
  }

  return {
    limit:
      typeof body?.limit === "number" && Number.isFinite(body.limit)
        ? Math.max(1, Math.min(20, Math.trunc(body.limit)))
        : 10,
    query: query.slice(0, 120),
  };
}
