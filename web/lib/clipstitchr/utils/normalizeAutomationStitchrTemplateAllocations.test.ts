import { describe, expect, it } from "vitest";
import { normalizeAutomationStitchrTemplateAllocations } from "@/lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations";

describe("normalizeAutomationStitchrTemplateAllocations", () => {
  it("dedupes template counts and caps them to the draft count", () => {
    expect(
      normalizeAutomationStitchrTemplateAllocations(
        [
          { templateId: "template_1", count: 2 },
          { templateId: "template_1", count: 3 },
          { templateId: "template_2", count: 2 },
        ],
        5,
      ),
    ).toEqual([{ templateId: "template_1", count: 5 }]);
  });

  it("drops unavailable, empty, and non-positive allocations", () => {
    expect(
      normalizeAutomationStitchrTemplateAllocations(
        [
          { templateId: " template_1 ", count: 2 },
          { templateId: "template_2", count: 2 },
          { templateId: "", count: 2 },
          { templateId: "template_3", count: 0 },
        ],
        3,
        new Set(["template_1"]),
      ),
    ).toEqual([{ templateId: "template_1", count: 2 }]);
  });
});
