export function createSocialPublishingProductUrl(path: string, productId?: string) {
  const normalizedProductId = productId?.trim();

  if (!normalizedProductId) {
    return path;
  }

  const searchParams = new URLSearchParams({
    productId: normalizedProductId,
  });

  return `${path}?${searchParams.toString()}`;
}
