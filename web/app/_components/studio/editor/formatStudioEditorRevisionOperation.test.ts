import { describe, expect, it } from "vitest";
import { formatStudioEditorRevisionOperation } from "./formatStudioEditorRevisionOperation";

describe("formatStudioEditorRevisionOperation", () => {
  it("uses plain labels for every durable project operation", () => {
    expect(formatStudioEditorRevisionOperation("create")).toBe("Started");
    expect(formatStudioEditorRevisionOperation("autosave")).toBe("Autosaved");
    expect(formatStudioEditorRevisionOperation("archive")).toBe("Archived");
    expect(formatStudioEditorRevisionOperation("reopen")).toBe("Reopened");
  });
});
