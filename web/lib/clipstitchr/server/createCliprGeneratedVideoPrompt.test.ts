import { describe, expect, it } from "vitest";
import { createCliprGeneratedVideoPrompt } from "@/lib/clipstitchr/server/createCliprGeneratedVideoPrompt";

const baseOptions = {
  audienceDetails: "Founders and solo marketers.",
  filledHook: "The small workflow mistake most people miss",
  productDetails: "Helps founders organize product launch content.",
  productName: "LaunchKit",
  scenePrompt: "A founder organizes a launch calendar.",
};

describe("createCliprGeneratedVideoPrompt", () => {
  it("blocks text, UI, and speaking in b-roll scene prompts", () => {
    const prompt = createCliprGeneratedVideoPrompt({
      ...baseOptions,
      contentType: "b-roll-reel",
    });

    expect(prompt).toContain("Never render captions");
    expect(prompt).toContain("phone screens");
    expect(prompt).toContain("social-media interfaces");
    expect(prompt).toContain("silent b-roll only");
    expect(prompt).toContain("no voiceover");
    expect(prompt).toContain("no person visibly speaking");
  });

  it("keeps voiceover reel visuals silent while allowing separate narration", () => {
    const prompt = createCliprGeneratedVideoPrompt({
      ...baseOptions,
      contentType: "voiceover-reel",
    });

    expect(prompt).toContain("separate avatar-voice narration");
    expect(prompt).toContain("Do not show anyone speaking");
    expect(prompt).toContain("Never render captions");
  });
});
