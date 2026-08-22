const exactPublicAgentResources = new Set([
  "/api",
  "/api/tools/app-hook-generator",
  "/feed.xml",
  "/llms.txt",
  "/openapi.json",
  "/robots.txt",
  "/sitemap.xml",
  "/video-sitemap.xml",
]);

export function getPathIsPublicAgentResource(pathname: string) {
  return (
    exactPublicAgentResources.has(pathname) ||
    pathname === "/api/v1" ||
    pathname.startsWith("/api/v1/")
  );
}
