export function redactGeminiVideoAnalysisR2Key(key?: string) {
  if (!key) {
    return undefined;
  }

  const parts = key.split("/").filter(Boolean);
  const lastSegment = parts.at(-1) ?? "object";

  if (parts[0] === "users" && parts.length >= 3) {
    return `${parts[2]}/.../${lastSegment}`;
  }

  return `${parts[0] ?? "object"}/.../${lastSegment}`;
}
