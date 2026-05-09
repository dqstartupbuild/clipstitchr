export function getReplicateOutputUrls(output: unknown): string[] {
  if (typeof output === "string") {
    return [output];
  }

  if (Array.isArray(output)) {
    return output.flatMap((item) => getReplicateOutputUrls(item));
  }

  if (output && typeof output === "object" && "url" in output) {
    const url = (output as { url?: unknown }).url;

    return typeof url === "string" ? [url] : [];
  }

  return [];
}
