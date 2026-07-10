import { describe, expect, it } from "vitest";
import { SWIPR_CREATIVE_CONTEXT_MAX_LENGTH } from "@/lib/clipstitchr/constants/swiprCreativeContextMaxLength";
import { normalizeSwiprCreativeContext } from "@/lib/clipstitchr/utils/normalizeSwiprCreativeContext";

describe("normalizeSwiprCreativeContext", () => {
  it("trims and caps user creative context", () => {
    expect(normalizeSwiprCreativeContext("  Focus on adult acne.  ")).toBe(
      "Focus on adult acne.",
    );
    expect(
      normalizeSwiprCreativeContext(
        "a".repeat(SWIPR_CREATIVE_CONTEXT_MAX_LENGTH + 10),
      ),
    ).toHaveLength(SWIPR_CREATIVE_CONTEXT_MAX_LENGTH);
  });

  it("returns an empty string for non-text values", () => {
    expect(normalizeSwiprCreativeContext(null)).toBe("");
  });
});
