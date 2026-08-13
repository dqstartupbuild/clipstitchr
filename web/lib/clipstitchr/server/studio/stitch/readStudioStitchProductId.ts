export function readStudioStitchProductId(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId")?.trim();
  if (!productId || productId.length > 120) {
    throw new Error("Choose an active Product.");
  }

  return productId;
}
