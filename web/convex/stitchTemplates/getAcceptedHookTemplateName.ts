const TEMPLATE_NAME_MAX_LENGTH = 120;

export function getAcceptedHookTemplateName(hookText: string) {
  const normalizedHook = hookText.trim().replace(/\s+/g, " ");

  return normalizedHook
    ? `Winner: ${normalizedHook}`.slice(0, TEMPLATE_NAME_MAX_LENGTH)
    : "Winner template";
}
