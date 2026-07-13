import { describe, expect, it } from "vitest";
import { createNotionKitTemplateCsv } from "@/lib/clipstitchr/tools/notionKit/createNotionKitTemplateCsv";
import { notionKitTemplates } from "@/lib/clipstitchr/tools/notionKit/notionKitTemplates";

describe("notionKitTemplates", () => {
  it("provides five distinct importable CSV templates with aligned rows", () => {
    expect(notionKitTemplates).toHaveLength(5);
    expect(
      new Set(notionKitTemplates.map((template) => template.fileName)),
    ).toHaveLength(5);

    for (const template of notionKitTemplates) {
      expect(template.columns.length).toBeGreaterThanOrEqual(10);
      expect(template.rows).toHaveLength(2);
      expect(
        template.rows.every((row) => row.length === template.columns.length),
      ).toBe(true);
      expect(createNotionKitTemplateCsv(template).split("\r\n")).toHaveLength(
        3,
      );
      expect(template.propertyNotes.length).toBeGreaterThanOrEqual(2);
    }
  });
});
