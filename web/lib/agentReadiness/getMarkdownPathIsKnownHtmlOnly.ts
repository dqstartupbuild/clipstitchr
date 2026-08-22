const knownHtmlOnlyNamespaces = [
  "/blog",
  "/case-studies",
  "/docs",
  "/examples",
  "/pricing",
  "/privacy",
  "/terms",
  "/tools",
];

export function getMarkdownPathIsKnownHtmlOnly(pathname: string) {
  return knownHtmlOnlyNamespaces.some(
    (namespace) =>
      pathname === namespace || pathname.startsWith(`${namespace}/`),
  );
}
