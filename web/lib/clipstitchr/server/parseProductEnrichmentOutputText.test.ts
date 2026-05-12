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
      cliprPlaceholderFillers: {},
      eligibleCliprHookStyleKeys: [],
      eligibleCliprHookTemplateIds: [],
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

  it("normalizes Clipr hook eligibility metadata", () => {
    expect(
      parseProductEnrichmentOutputText(
        JSON.stringify({
          inferredPainPoints: [],
          eligibleCliprHookStyleKeys: ["mystery_gap", "bad_style"],
          eligibleCliprHookTemplateIds: ["MG-001", "BAD-001"],
          cliprPlaceholderFillers: {
            audience: ["solo founders", ""],
            topic: ["short-form ads"],
          },
        }),
      ),
    ).toMatchObject({
      eligibleCliprHookStyleKeys: ["mystery_gap"],
      eligibleCliprHookTemplateIds: ["MG-001"],
      cliprPlaceholderFillers: {
        audience: ["solo founders"],
        topic: ["short-form ads"],
      },
    });
  });

  it("returns empty enrichment for malformed model JSON", () => {
    expect(
      parseProductEnrichmentOutputText(
        '{"inferredProblem":"Teams publish slowly","inferredPainPoints":["Editing',
      ),
    ).toEqual({
      cliprPlaceholderFillers: {},
      eligibleCliprHookStyleKeys: [],
      eligibleCliprHookTemplateIds: [],
      inferredProblem: undefined,
      inferredPainPoints: [],
    });
  });

  it("keeps broad hook eligibility and larger filler sets", () => {
    const fillerValues = Array.from(
      { length: 16 },
      (_, index) => `simple audience ${index + 1}`,
    );

    expect(
      parseProductEnrichmentOutputText(
        JSON.stringify({
          inferredPainPoints: Array.from(
            { length: 12 },
            (_, index) => `pain point ${index + 1}`,
          ),
          eligibleCliprHookStyleKeys: [
            "mystery_gap",
            "authority_signal",
            "anti_advice",
            "inside_room",
            "direct_diagnosis",
            "before_after_arc",
            "cost_alert",
            "deadline_pull",
            "receipt_stack",
            "future_cast",
            "test_drive",
            "pattern_break",
            "vulnerable_reveal",
            "viewer_dare",
            "cold_open_story",
          ],
          cliprPlaceholderFillers: {
            audience: fillerValues,
            fake_key: ["should be removed"],
          },
        }),
      ),
    ).toMatchObject({
      inferredPainPoints: [
        "pain point 1",
        "pain point 2",
        "pain point 3",
        "pain point 4",
        "pain point 5",
        "pain point 6",
        "pain point 7",
        "pain point 8",
        "pain point 9",
        "pain point 10",
      ],
      eligibleCliprHookStyleKeys: [
        "mystery_gap",
        "authority_signal",
        "anti_advice",
        "inside_room",
        "direct_diagnosis",
        "before_after_arc",
        "cost_alert",
        "deadline_pull",
        "receipt_stack",
        "future_cast",
        "test_drive",
        "pattern_break",
        "vulnerable_reveal",
        "viewer_dare",
        "cold_open_story",
      ],
      cliprPlaceholderFillers: {
        audience: fillerValues,
      },
    });
  });
});
