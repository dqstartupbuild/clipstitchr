function isOutputUrlString(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function getSwaprPredictionOutputUrl(output: unknown): string | null {
  if (typeof output === "string") {
    return isOutputUrlString(output) ? output : null;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = getSwaprPredictionOutputUrl(item);

      if (url) {
        return url;
      }
    }
  }

  if (output && typeof output === "object") {
    if ("url" in output) {
      const url = (output as { url?: unknown }).url;

      if (typeof url === "string" && isOutputUrlString(url)) {
        return url;
      }
    }

    for (const value of Object.values(output)) {
      const url = getSwaprPredictionOutputUrl(value);

      if (url) {
        return url;
      }
    }
  }

  return null;
}
