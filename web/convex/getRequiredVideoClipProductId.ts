export function getRequiredVideoClipProductId(productId?: string) {
  const requestedProductId = productId?.trim() || "";

  if (!requestedProductId) {
    throw new Error("Choose a product before saving this video.");
  }

  return requestedProductId;
}
