export function isFiniteStudioEditorNumber(
  candidate: unknown,
): candidate is number {
  return typeof candidate === "number" && Number.isFinite(candidate);
}
