type ProductAccessCandidate = Readonly<{
  archivedAt?: string;
  createdAt: string;
  id: string;
}>;

export function getUnlockedProductIds(
  products: readonly ProductAccessCandidate[],
  defaultProductId: string | undefined,
  productLimit: number,
) {
  const activeProducts = products
    .filter((product) => !product.archivedAt)
    .toSorted(
      (left, right) =>
        left.createdAt.localeCompare(right.createdAt) ||
        left.id.localeCompare(right.id),
    );
  const normalizedLimit = Math.max(0, Math.floor(productLimit));

  if (normalizedLimit === 0 || activeProducts.length === 0) {
    return [];
  }

  const defaultProduct =
    activeProducts.find((product) => product.id === defaultProductId) ??
    activeProducts[0];
  const unlockedProductIds = [defaultProduct.id];

  for (const product of activeProducts) {
    if (
      unlockedProductIds.length >= normalizedLimit ||
      product.id === defaultProduct.id
    ) {
      continue;
    }

    unlockedProductIds.push(product.id);
  }

  return unlockedProductIds;
}
