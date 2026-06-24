import { renderInlineMarkdown } from "./renderInlineMarkdown";
import { splitMarkdownTableRow } from "./splitMarkdownTableRow";

function renderTableCell(tag: "td" | "th", cell: string) {
  return `<${tag}>${renderInlineMarkdown(cell)}</${tag}>`;
}

export function renderMarkdownTable(lines: string[]) {
  const headers = splitMarkdownTableRow(lines[0]);
  const rows = lines.slice(2).map(splitMarkdownTableRow);
  const headerHtml = headers
    .map((header) => renderTableCell("th", header))
    .join("");
  const bodyHtml = rows
    .map((row) => {
      const cells = headers.map((_, index) => renderTableCell("td", row[index] ?? ""));

      return `<tr>${cells.join("")}</tr>`;
    })
    .join("");

  return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
}
