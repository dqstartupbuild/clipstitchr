import { describe, expect, it } from "vitest";
import { createCliprAvatarVideoPrompt } from "@/lib/clipstitchr/server/createCliprAvatarVideoPrompt";

describe("createCliprAvatarVideoPrompt", () => {
  it("describes the desired avatar video with affirmative instructions only", () => {
    const prompt = createCliprAvatarVideoPrompt();

    expect(prompt).toContain("one continuous, realistic talking-head video");
    expect(prompt).toContain("complete visual reference");
    expect(prompt).toContain("Keep a clean real-world camera frame");
    expect(prompt).not.toMatch(
      /\b(do not|don't|dont|no|not|without|caption|subtitle|logo|app screen|ui|graphic overlay|b-roll)\b/i,
    );
  });
});
