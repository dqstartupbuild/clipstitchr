import { describe, expect, it } from "vitest";
import { getGeneratedTextHasAiSlop } from "@/lib/clipstitchr/utils/getGeneratedTextHasAiSlop";

describe("getGeneratedTextHasAiSlop", () => {
  it.each([
    "This is a game changer",
    "Unlock your potential today",
    "Whether you're new or experienced, this works",
    "It is not just a tool, but a powerful solution",
    "In today's fast-paced world, speed matters",
  ])("flags canned generated writing: %s", (text) => {
    expect(getGeneratedTextHasAiSlop(text)).toBe(true);
  });

  it("allows concrete plain-language writing", () => {
    expect(
      getGeneratedTextHasAiSlop("Three launch clips are still waiting for captions"),
    ).toBe(false);
  });
});
