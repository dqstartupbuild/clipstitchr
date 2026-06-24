export function extractHtmlAttribute(html: string, attributeName: string) {
  const pattern = new RegExp(`${attributeName}\\s*=\\s*["']([^"']+)["']`, "i");
  const match = html.match(pattern);

  return match?.[1];
}
