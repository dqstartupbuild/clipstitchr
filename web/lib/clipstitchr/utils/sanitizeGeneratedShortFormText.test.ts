import { describe, expect, it } from "vitest";
import { sanitizeGeneratedShortFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedShortFormText";

describe("sanitizeGeneratedShortFormText", () => {
  it("keeps a concrete CTA while rejecting canned AI copy", () => {
    expect(
      sanitizeGeneratedShortFormText({
        fallback: "Save this launch checklist",
        maxLength: 120,
        text: "Level up your launch",
      }),
    ).toBe("Save this launch checklist");
  });
});
