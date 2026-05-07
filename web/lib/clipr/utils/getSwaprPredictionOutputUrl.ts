export function getSwaprPredictionOutputUrl(output: unknown): string | null {
  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const url = getSwaprPredictionOutputUrl(item);

      if (url) {
        return url;
      }
    }
  }

  if (output && typeof output === "object" && "url" in output) {
    const url = (output as { url?: unknown }).url;

    return typeof url === "string" ? url : null;
  }

  return null;
}
