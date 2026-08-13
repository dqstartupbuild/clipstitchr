export function getStudioReelOutputObjectKey(input: {
  ownerId: string;
  productId: string;
  recipeId: string;
  runId: string;
}) {
  return [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/media-output`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.runId),
    encodeURIComponent(input.recipeId),
    "output.mp4",
  ].join("/");
}
