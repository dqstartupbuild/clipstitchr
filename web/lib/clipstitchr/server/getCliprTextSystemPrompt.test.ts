import { describe, expect, it } from "vitest";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";

describe("getCliprTextSystemPrompt", () => {
  it("uses a Stitchr-specific creator-discovery role", () => {
    const prompt = getCliprTextSystemPrompt("stitchr");

    expect(prompt).toContain("native creator-discovery overlays");
    expect(prompt).toContain("supplied ordered video sources");
    expect(prompt).toContain("Hook Library patterns as mechanisms");
    expect(prompt).toContain("UGC-only sources");
    expect(prompt).toContain("Demo-only sources");
    expect(prompt).toContain("best three");
    expect(prompt).toContain("Do not write scripts");
    expect(prompt).not.toContain("audience-first short-form hooks");
  });
});
