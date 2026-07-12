export function parseHookLabIdeaUseJobInput(inputSnapshotJson: string) {
  const input = JSON.parse(inputSnapshotJson) as unknown;

  if (!input || typeof input !== "object") {
    throw new Error("Invalid Hook Lab use job input.");
  }

  const variantId = (input as Record<string, unknown>).variantId;

  if (typeof variantId !== "string" || !variantId.trim()) {
    throw new Error("Hook Lab use job is missing its version ID.");
  }

  return { variantId: variantId.trim() };
}
