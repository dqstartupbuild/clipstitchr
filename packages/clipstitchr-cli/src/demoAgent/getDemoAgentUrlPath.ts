export function getDemoAgentUrlPath(url: string) {
  const parsedUrl = new URL(url);

  return parsedUrl.pathname || "/";
}
