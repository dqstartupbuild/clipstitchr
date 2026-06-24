export function isMarkdownTableRow(line: string) {
  return line.includes("|") && line.trim().length > 0;
}
