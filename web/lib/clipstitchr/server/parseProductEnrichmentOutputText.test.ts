import { describe, expect, it } from "vitest";
import { parseProductEnrichmentOutputText } from "@/lib/clipstitchr/server/parseProductEnrichmentOutputText";

describe("parseProductEnrichmentOutputText", () => {
  it("parses compact JSON output", () => {
    expect(
      parseProductEnrichmentOutputText(
        JSON.stringify({
          inferredProblem: "Teams do not publish enough clips.",
          inferredPainPoints: ["Editing takes too long", "Assets are scattered"],
        }),
      ),
    ).toEqual({
      inferredProblem: "Teams do not publish enough clips.",
      inferredPainPoints: ["Editing takes too long", "Assets are scattered"],
    });
  });

  it("parses fenced JSON output", () => {
    expect(
      parseProductEnrichmentOutputText(
        '```json\n{"problemSolved":"Slow ad production","inferredPainPoints":["No editor","No workflow"]}\n```',
      ).inferredProblem,
    ).toBe("Slow ad production");
  });
});
