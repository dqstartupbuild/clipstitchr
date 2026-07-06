export function readPostBridgeProductIdFromRequest(request: Request) {
  return new URL(request.url).searchParams.get("productId")?.trim() ?? "";
}
