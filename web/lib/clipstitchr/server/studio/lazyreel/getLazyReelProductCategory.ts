export function getLazyReelProductCategory(product: string) {
  return (
    product
      .trim()
      .replace(/^(a|an|the)\s+/iu, "")
      .replace(/\$?\d[\d,.]*\s*/gu, "")
      .replace(/\s*(kit|set|bundle|niche)\s*$/iu, "")
      .trim() || "product"
  );
}
