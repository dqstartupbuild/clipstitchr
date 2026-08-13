import { describe, expect, it } from "vitest";
import { parseLazyReelStudioStitchBrief } from "./parseLazyReelStudioStitchBrief";

describe("parseLazyReelStudioStitchBrief", () => {
  it("adapts a saved make_brief payload without inventing product proof", () => {
    const brief = parseLazyReelStudioStitchBrief(
      JSON.stringify({
        tool: "make_brief",
        data: {
          angle: { name: "Show the relief", note: "", shots: 3 },
          audience: "Busy makers",
          beats: [
            {
              beat: "Friction",
              broll: "Show the old workflow",
              onScreenText: "Still doing this?",
              voiceover: "This used to take all afternoon.",
            },
            {
              beat: "Proof",
              broll: "Show the Product result",
              onScreenText: "One clean pass",
              voiceover: "Now the proof is visible in one pass.",
            },
          ],
          breakoutChecklist: [],
          concepts: [],
          framework: { acronym: "PAS", id: "pas", name: "Problem, Agitate, Solve" },
          hooks: [
            {
              delivery: "Direct to camera",
              pattern: "confession",
              text: "I stopped doing this the hard way.",
            },
          ],
          mode: "product",
          objective: "Show the saved Product result in one pass.",
          product: "ClipStitchr",
        },
      }),
    );

    expect(brief?.directionName).toBe("Problem, Agitate, Solve");
    expect(brief?.hook).toBe("I stopped doing this the hard way.");
    expect(brief?.productProof).toBe("Show the saved Product result in one pass.");
    expect(brief?.beatScript).toEqual([
      "This used to take all afternoon.",
      "Now the proof is visible in one pass.",
    ]);
  });

  it("ignores malformed or unrelated saved payloads", () => {
    expect(parseLazyReelStudioStitchBrief("not json")).toBeNull();
    expect(
      parseLazyReelStudioStitchBrief(
        JSON.stringify({ tool: "search", data: { hooks: [], beats: [] } }),
      ),
    ).toBeNull();
  });
});
