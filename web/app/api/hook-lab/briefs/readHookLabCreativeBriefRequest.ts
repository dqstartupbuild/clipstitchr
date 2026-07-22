export function readHookLabCreativeBriefRequest(value: unknown) {
  const body =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  const sourcePostId =
    typeof body.sourcePostId === "string" ? body.sourcePostId.trim() : "";
  if (!productId) {
    throw new Error("Select a product from the dashboard product picker first.");
  }

  if (!sourcePostId) {
    throw new Error("Choose a completed Hook Lab report.");
  }

  return {
    productId,
    sourcePostId,
  };
}
