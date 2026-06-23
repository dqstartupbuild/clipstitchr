export function getBrowserTimeZone() {
  if (typeof window === "undefined" || typeof Intl === "undefined") {
    return undefined;
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const normalizedTimeZone =
      typeof timeZone === "string" ? timeZone.trim() : "";

    return normalizedTimeZone || undefined;
  } catch {
    return undefined;
  }
}
