export async function readTikTokSoundImportRequest(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const sourceUrl =
    typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";

  if (!sourceUrl || !/^https:\/\/([a-z0-9-]+\.)?tiktok\.com\//i.test(sourceUrl)) {
    throw new Error("Paste a TikTok link.");
  }

  return { sourceUrl: sourceUrl.slice(0, 2000) };
}
