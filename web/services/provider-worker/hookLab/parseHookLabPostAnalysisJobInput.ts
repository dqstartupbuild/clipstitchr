export function parseHookLabPostAnalysisJobInput(inputSnapshotJson: string) {
  let input: unknown;

  try {
    input = JSON.parse(inputSnapshotJson);
  } catch {
    throw new Error("Hook Lab post analysis input is invalid.");
  }

  const postId =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>).postId
      : undefined;

  if (typeof postId !== "string" || !postId.trim()) {
    throw new Error("Hook Lab post analysis input is missing the post ID.");
  }

  return { postId: postId.trim() };
}
