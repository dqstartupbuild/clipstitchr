export type ProductCardFieldSource = {
  createdAt: string;
  id: string;
  name: string;
  ownerId: string;
  postBridgeSocialAccountIds?: number[];
  updatedAt: string;
  websiteUrl?: string;
};

export function createProductCardFields(product: ProductCardFieldSource) {
  return {
    ownerId: product.ownerId,
    id: product.id,
    name: product.name,
    websiteUrl: product.websiteUrl,
    postBridgeSocialAccountIds: product.postBridgeSocialAccountIds,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
