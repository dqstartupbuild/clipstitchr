import { describe, expect, it } from "vitest";
import { getStitchrTextCompositionPromptLines } from "@/lib/clipstitchr/server/getStitchrTextCompositionPromptLines";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

function context(role: StitchrTextGenerationClipContext["role"]) {
  return { id: role, name: role, role };
}

describe("getStitchrTextCompositionPromptLines", () => {
  it("uses paired guidance only for exactly ordered UGC then Demo sources", () => {
    const lines = getStitchrTextCompositionPromptLines([
      context("ugc"),
      context("demo"),
    ]);

    expect(lines).toContain("Composition: paired UGC then Demo.");
    expect(lines).toContain(
      "Creative progression: private thought or confession -> genuine reaction -> Demo reveals the discovery.",
    );
  });

  it.each([
    ["a Demo then UGC sequence", [context("demo"), context("ugc")]],
    [
      "a three-source UGC, Demo, UGC sequence",
      [context("ugc"), context("demo"), context("ugc")],
    ],
    ["multiple UGC sources", [context("ugc"), context("ugc")]],
    ["multiple Demo sources", [context("demo"), context("demo")]],
  ])("uses ordered-sequence guidance for %s", (_description, contexts) => {
    const lines = getStitchrTextCompositionPromptLines(contexts);
    const prompt = lines.join("\n");

    expect(lines).toContain("Composition: ordered source sequence.");
    expect(prompt).toContain("Honor the supplied source order");
    expect(prompt).toContain("Do not assume a UGC-to-Demo structure");
    expect(lines).not.toContain("Composition: paired UGC then Demo.");
  });

  it("keeps standalone UGC and Demo guidance", () => {
    expect(getStitchrTextCompositionPromptLines([context("ugc")])).toContain(
      "Composition: standalone UGC.",
    );
    expect(getStitchrTextCompositionPromptLines([context("demo")])).toContain(
      "Composition: standalone Demo.",
    );
  });

  it("uses unavailable-source guidance when no roles were supplied", () => {
    expect(getStitchrTextCompositionPromptLines([])).toContain(
      "Composition: source roles are unavailable.",
    );
  });
});
