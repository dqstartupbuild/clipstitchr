export function getSocialProviderErrorCode(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      error?: {
        code?: unknown;
      };
    };
    const code = parsed.error?.code;

    if (typeof code === "string" && code.trim()) {
      return code.trim();
    }

    if (typeof code === "number" && Number.isFinite(code)) {
      return String(code);
    }
  } catch {
    return undefined;
  }

  return undefined;
}
