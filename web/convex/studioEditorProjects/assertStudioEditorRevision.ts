export function assertStudioEditorRevision(
  revision: number,
  label = "Expected revision",
) {
  if (
    !Number.isInteger(revision) ||
    revision < 1 ||
    revision > Number.MAX_SAFE_INTEGER
  ) {
    throw new Error(`${label} must be a positive safe integer.`);
  }
  return revision;
}
