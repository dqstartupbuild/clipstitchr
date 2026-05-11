export function getSwiprSwipeName(productName: string) {
  const normalizedProductName = productName.trim() || "Product";

  return `${normalizedProductName} carousel`;
}
