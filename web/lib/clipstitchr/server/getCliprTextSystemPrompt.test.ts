import { describe, expect, it } from "vitest";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";

describe("getCliprTextSystemPrompt", () => {
  it("uses a Stitchr-specific library-ranking creative role", () => {
    const prompt = getCliprTextSystemPrompt("stitchr");

    expect(prompt).toContain("short-form creative director");
    expect(prompt).toContain("UGC-to-Demo stitched videos");
    expect(prompt).toContain("Hook Library patterns");
    expect(prompt).toContain("best three");
    expect(prompt).toContain("Do not write scripts");
    expect(prompt).not.toContain("audience-first short-form hooks");
  });
});
