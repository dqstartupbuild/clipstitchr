export function createCaseInsensitiveTextPattern(text: string) {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
