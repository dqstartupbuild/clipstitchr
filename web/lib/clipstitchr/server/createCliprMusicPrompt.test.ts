import { describe, expect, it } from "vitest";
import { createCliprMusicPrompt } from "@/lib/clipstitchr/server/createCliprMusicPrompt";

describe("createCliprMusicPrompt", () => {
  it("keeps generated music under spoken narration", () => {
    const prompt = createCliprMusicPrompt({
      audienceDetails: "Founders who need faster ad production.",
      productName: "ClipStitchr",
      script: "The real reason your content library feels stuck is repetition.",
    });

    expect(prompt).toContain("Instrumental-only");
    expect(prompt).toContain("No vocals");
    expect(prompt).toContain("underneath spoken narration");
  });
});
