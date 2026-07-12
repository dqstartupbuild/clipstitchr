export function parseHookLabIdeaAnalysisJobInput(inputSnapshotJson: string) {
  const input = JSON.parse(inputSnapshotJson) as unknown;

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Hook Lab analysis job input is invalid.");
  }

  const ideaId = (input as Record<string, unknown>).ideaId;

  if (typeof ideaId !== "string" || !ideaId.trim()) {
    throw new Error("Hook Lab analysis job is missing its idea ID.");
  }

  return { ideaId: ideaId.trim() };
}
