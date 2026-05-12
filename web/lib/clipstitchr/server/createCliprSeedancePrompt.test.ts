import { describe, expect, it } from "vitest";
import { createCliprSeedancePrompt } from "@/lib/clipstitchr/server/createCliprSeedancePrompt";

describe("createCliprSeedancePrompt", () => {
  it("keeps image and audio references while avoiding high-risk face-copy wording", () => {
    const prompt = createCliprSeedancePrompt({
      avatarPrompt:
        "A creator speaks in a clean kitchen with morning light and soft appliance hum.",
      script: "This is the small habit most people skip before a busy day.",
    });

    expect(prompt).toContain("[Image1]");
    expect(prompt).toContain("[Audio1]");
    expect(prompt).not.toContain("facial features");
    expect(prompt).not.toContain("lip sync");
    expect(prompt).not.toContain("same character");
    expect(prompt).not.toContain("workout");
  });
});
