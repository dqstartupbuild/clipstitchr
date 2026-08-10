export function readSocialPublishingProductIdFromRequest(request: Request) {
  return new URL(request.url).searchParams.get("productId")?.trim() ?? "";
}
