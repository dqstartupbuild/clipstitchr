import { describe, expect, it } from "vitest";
import { getPrunaSwiprBackgroundPromptContext } from "@/lib/clipstitchr/server/getPrunaSwiprBackgroundPromptContext";

describe("getPrunaSwiprBackgroundPromptContext", () => {
  it("removes terms that pull Pruna image models toward UI mockups", () => {
    const context = getPrunaSwiprBackgroundPromptContext(
      "A TikTok carousel ad for an iPhone app with screen text, logo, and social media copy.",
    ).toLowerCase();

    expect(context).not.toContain("tiktok");
    expect(context).not.toContain("carousel");
    expect(context).not.toContain("ad");
    expect(context).not.toContain("iphone");
    expect(context).not.toContain("app");
    expect(context).not.toContain("screen");
    expect(context).not.toContain("text");
    expect(context).not.toContain("logo");
  });
});
