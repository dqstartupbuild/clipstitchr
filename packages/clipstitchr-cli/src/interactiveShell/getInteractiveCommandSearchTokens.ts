export function getInteractiveCommandSearchTokens(value: string) {
  return value
    .trim()
    .replace(/^\//, "")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^-+/, ""))
    .filter(Boolean);
}
