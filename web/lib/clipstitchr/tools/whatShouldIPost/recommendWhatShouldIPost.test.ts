import { describe, expect, it } from "vitest";
import { defaultWhatShouldIPostInput } from "@/lib/clipstitchr/tools/whatShouldIPost/defaultWhatShouldIPostInput";
import { recommendWhatShouldIPost } from "@/lib/clipstitchr/tools/whatShouldIPost/recommendWhatShouldIPost";

describe("recommendWhatShouldIPost", () => {
  it("returns one format, three prompts, captures, and a next tool", () => {
    const result = recommendWhatShouldIPost(defaultWhatShouldIPostInput);

    expect(result.format).toBe("Voiceover app demo");
    expect(result.prompts).toHaveLength(3);
    expect(result.captures.length).toBeGreaterThan(0);
    expect(result.nextToolKey).toBe("app-demo-recording-checklist");
  });

  it("uses a useful no-demo fallback without inventing assets", () => {
    const result = recommendWhatShouldIPost({
      ...defaultWhatShouldIPostInput,
      assets: [],
      cameraPreference: "off-camera",
      capacity: "quick",
    });

    expect(result.format).toBe("Simple problem-and-payoff post");
    expect(result.reason).toContain("do not need a finished demo");
    expect(result.nextToolKey).toBe("app-ad-shot-list-generator");
  });

  it("changes the recommendation for each content goal", () => {
    const formats = ["reach", "explain", "convert", "retain"].map(
      (goal) =>
        recommendWhatShouldIPost({
          ...defaultWhatShouldIPostInput,
          goal: goal as typeof defaultWhatShouldIPostInput.goal,
        }).format,
    );

    expect(new Set(formats).size).toBe(4);
  });
});
