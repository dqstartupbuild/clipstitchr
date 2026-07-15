import { describe, expect, it } from "vitest";
import { normalizeSwiprPostDescription } from "@/lib/clipstitchr/utils/normalizeSwiprPostDescription";

describe("normalizeSwiprPostDescription", () => {
  it("keeps a short useful description without padding it", () => {
    expect(
      normalizeSwiprPostDescription({
        fallback: "Fallback",
        value: "Name the launch task that keeps getting skipped.",
      }),
    ).toBe("Name the launch task that keeps getting skipped.");
  });

  it("rejects canned AI copy and uses the factual fallback", () => {
    expect(
      normalizeSwiprPostDescription({
        fallback: "Three clips still need captions.",
        value: "In today's fast-paced world, this is a game changer.",
      }),
    ).toBe("Three clips still need captions.");
  });
});
