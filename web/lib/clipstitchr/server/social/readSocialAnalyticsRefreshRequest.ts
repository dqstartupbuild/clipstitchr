export async function readSocialAnalyticsRefreshRequest(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;

  return {
    productId:
      typeof body.productId === "string" && body.productId.trim()
        ? body.productId.trim()
        : undefined,
    socialAccountId:
      typeof body.socialAccountId === "string" && body.socialAccountId.trim()
        ? body.socialAccountId.trim()
        : undefined,
    rangeStart:
      typeof body.rangeStart === "string" && body.rangeStart.trim()
        ? body.rangeStart.trim()
        : undefined,
    rangeEnd:
      typeof body.rangeEnd === "string" && body.rangeEnd.trim()
        ? body.rangeEnd.trim()
        : undefined,
    includeTikTokSaves: body.includeTikTokSaves === true,
  };
}
