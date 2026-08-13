export async function createStudioReelWorkerOutputId(
  runId: string,
  recipeId: string,
) {
  const bytes = new TextEncoder().encode(`${runId}\u0000${recipeId}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const hex = Array.from(digest, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
  return `studio_reel_output_${hex}`;
}
