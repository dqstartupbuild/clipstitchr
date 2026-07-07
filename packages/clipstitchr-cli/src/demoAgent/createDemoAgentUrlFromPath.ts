export function createDemoAgentUrlFromPath(currentUrl: string, path: string) {
  const current = new URL(currentUrl);
  const next = new URL(path, current.origin);

  return next.toString();
}
