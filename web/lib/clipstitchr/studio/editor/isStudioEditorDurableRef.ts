export function isStudioEditorDurableRef(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= 512 &&
    !/^(?:https?:|data:|blob:)/i.test(normalized)
  );
}
