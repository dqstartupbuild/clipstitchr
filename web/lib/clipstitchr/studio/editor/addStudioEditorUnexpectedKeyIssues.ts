export function addStudioEditorUnexpectedKeyIssues(
  value: Record<string, unknown>,
  path: string,
  allowedKeys: readonly string[],
  add: (path: string, code: string, message: string) => void,
) {
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      add(
        path === "$" ? key : `${path}.${key}`,
        "unexpected_key",
        "This field is not part of Studio editor project version 1.",
      );
    }
  }
}
