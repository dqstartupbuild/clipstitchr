export function getPublishingComposerStorageKey(productId: string): string {
  return `clipstitchr:publishing-composer-draft:v2:${encodeURIComponent(productId)}`;
}
