import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";
import type { NotionKitTemplate } from "@/lib/clipstitchr/tools/notionKit/NotionKitTemplate";

export function createNotionKitTemplateCsv(template: NotionKitTemplate) {
  return createCsvText([template.columns, ...template.rows]);
}
