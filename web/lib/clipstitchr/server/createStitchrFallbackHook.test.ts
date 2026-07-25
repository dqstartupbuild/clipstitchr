import { describe, expect, it } from "vitest";
import { createStitchrFallbackHook } from "@/lib/clipstitchr/server/createStitchrFallbackHook";

describe("createStitchrFallbackHook", () => {
  it("turns the saved audience pain into a creator thought", () => {
    expect(
      createStitchrFallbackHook({
        audienceDetails: "Beginner founders",
        createdAt: "2026-07-25T00:00:00.000Z",
        id: "launchkit",
        inferredPainPoints: ["launch work keeps getting scattered"],
        name: "LaunchKit",
        productDetails: "Organizes launch work.",
        updatedAt: "2026-07-25T00:00:00.000Z",
      }),
    ).toBe("me realizing launch work keeps getting scattered");
  });
});
