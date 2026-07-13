import { describe, expect, it } from "vitest";
import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";

describe("createCsvText", () => {
  it("escapes commas, quotes, and line breaks for spreadsheet imports", () => {
    expect(
      createCsvText([
        ["Name", "Note"],
        ["Hook, one", 'Say "hello"\nthen demo'],
      ]),
    ).toBe('Name,Note\r\n"Hook, one","Say ""hello""\nthen demo"');
  });
});
