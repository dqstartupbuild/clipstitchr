export function createPublishingComposerIdempotencyKey() {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    return "";
  }
  return `publish_${crypto.randomUUID()}`;
}
