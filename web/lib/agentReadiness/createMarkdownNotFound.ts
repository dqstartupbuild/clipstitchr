export function createMarkdownNotFound(pathname: string) {
  return `# Not found\n\n\`${pathname}\` is not a ClipStitchr page. Recover with [the sitemap](/sitemap.xml), [agent guide](/llms.txt), [docs](/docs), [developer resources](/developers), or [OpenAPI](/openapi.json).\n`;
}
