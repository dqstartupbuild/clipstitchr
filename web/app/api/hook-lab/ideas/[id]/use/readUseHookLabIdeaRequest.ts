export async function readUseHookLabIdeaRequest(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const productId =
    typeof body.productId === "string" ? body.productId.trim() : "";
  const variationCount =
    typeof body.variationCount === "number" ? body.variationCount : 1;

  if (!productId) {
    throw new Error("Choose a product before using this idea.");
  }

  if (variationCount !== 1 && variationCount !== 3 && variationCount !== 5) {
    throw new Error("Choose 1, 3, or 5 versions.");
  }

  return {
    defaultAvatarId:
      typeof body.defaultAvatarId === "string"
        ? body.defaultAvatarId.trim() || undefined
        : undefined,
    defaultDemoClipId:
      typeof body.defaultDemoClipId === "string"
        ? body.defaultDemoClipId.trim() || undefined
        : undefined,
    productId,
    saveDefaults: body.saveDefaults === true,
    variationCount,
  };
}
