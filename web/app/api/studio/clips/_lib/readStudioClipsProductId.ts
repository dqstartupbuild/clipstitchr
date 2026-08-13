export function readStudioClipsProductId(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId")?.trim();
  if (!productId) throw new Error("Choose a Product for Studio Clips.");
  return productId;
}
