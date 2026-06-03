import { describe, expect, it } from "vitest";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";

describe("getCliprTextSystemPrompt", () => {
  it("uses a Stitchr-specific reaction overlay role", () => {
    const prompt = getCliprTextSystemPrompt("stitchr");

    expect(prompt).toContain("emotional visual overlay hooks");
    expect(prompt).toContain("reaction-based stitched videos");
    expect(prompt).toContain("Do not write scripts");
    expect(prompt).not.toContain("audience-first short-form hooks");
  });
});
