import { describe, expect, it } from "vitest";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";
import { selectStitchrHookCandidates } from "@/lib/clipstitchr/server/selectStitchrHookCandidates";
import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const product: ProductProfile = {
  audienceDetails: "People learning calisthenics",
  createdAt: "2026-07-25T00:00:00.000Z",
  eligibleCliprHookStyleKeys: ["before_after_arc", "pattern_break"],
  id: "guppy",
  inferredPainPoints: ["not knowing what exercise to do next"],
  inferredProblem: "calisthenics progress feels unclear",
  name: "Guppy",
  productDetails: "Guided calisthenics workouts and progress tracking.",
  updatedAt: "2026-07-25T00:00:00.000Z",
};

function createTemplate(
  id: string,
  styleKey: string,
  template: string,
  source: CliprHookTemplate["source"] = "clipstitchr",
): CliprHookTemplate {
  return {
    active: true,
    allowedPurposes: ["stitchr"],
    bestFor:
      styleKey === "before_after_arc"
        ? ["process improvement"]
        : ["reaction content"],
    emotionalTrigger: styleKey === "before_after_arc" ? "progress" : "surprise",
    id,
    requiredVariables: ["problem"],
    riskLevel:
      source === "polarizing_reaction_patterns" ? "aggressive" : "safe",
    source,
    styleKey,
    template,
  };
}

describe("selectStitchrHookCandidates", () => {
  it("ranks visually relevant product styles without forcing polarizing hooks", () => {
    const templates = [
      createTemplate(
        "BA-001",
        "before_after_arc",
        "The change that fixed {{problem}}",
      ),
      createTemplate(
        "PB-001",
        "pattern_break",
        "I did not expect {{problem}} to look like this",
      ),
      createTemplate(
        "PR-001",
        "identity_challenge",
        "Your standards are lower than you think",
        "polarizing_reaction_patterns",
      ),
      ...Array.from({ length: 20 }, (_, index) =>
        createTemplate(
          `MG-${String(index + 1).padStart(3, "0")}`,
          "mystery_gap",
          `A hidden part of {{problem}} ${index + 1}`,
        ),
      ),
    ];

    const candidates = selectStitchrHookCandidates({
      clipContexts: [
        {
          id: "ugc",
          name: "Surprised creator after a difficult rep",
          role: "ugc",
          tags: ["reaction", "progress"],
          videoDescription:
            "The athlete looks surprised after completing a controlled rep.",
        },
        {
          id: "demo",
          name: "Workout progress screen",
          productDescription:
            "The demo shows a guided workout and recorded progress.",
          role: "demo",
        },
      ],
      product,
      templates,
    });

    expect(candidates).toHaveLength(18);
    expect(candidates.slice(0, 2).map((template) => template.id)).toEqual([
      "BA-001",
      "PB-001",
    ]);
    expect(
      candidates
        .slice(0, 6)
        .filter((template) => template.styleKey === "mystery_gap"),
    ).toHaveLength(3);
    expect(candidates[0]?.source).not.toBe("polarizing_reaction_patterns");
  });

  it("penalizes unsupported numerical and performance claims", () => {
    const candidates = selectStitchrHookCandidates({
      clipContexts: [],
      product,
      templates: [
        createTemplate(
          "BA-SAFE",
          "before_after_arc",
          "A clearer way through {{problem}}",
        ),
        createTemplate(
          "BA-CLAIM",
          "before_after_arc",
          "Guaranteed results in 30 days",
        ),
      ],
    });

    expect(candidates[0]?.id).toBe("BA-SAFE");
  });

  it("uses twelve discovery mechanisms and six supporting patterns", () => {
    const discoveryTemplates = Array.from({ length: 24 }, (_, index) =>
      createTemplate(
        `UGD-${String(index + 1).padStart(3, "0")}`,
        (
          [
            "vulnerable_reveal",
            "cold_open_story",
            "direct_diagnosis",
            "mystery_gap",
            "pattern_break",
            "test_drive",
          ] as const
        )[index % 6] ?? "pattern_break",
        `not me realizing {{problem}} pattern ${index + 1}`,
        "ugc_discovery_patterns",
      ),
    );
    const supportingTemplates = Array.from({ length: 12 }, (_, index) =>
      createTemplate(
        `BASE-${String(index + 1).padStart(3, "0")}`,
        (["before_after_arc", "anti_advice", "identity_challenge"] as const)[
          index % 3
        ] ?? "before_after_arc",
        `A supporting {{problem}} pattern ${index + 1}`,
      ),
    );
    const candidates = selectStitchrHookCandidates({
      clipContexts: [],
      product,
      templates: [...discoveryTemplates, ...supportingTemplates],
    });

    expect(candidates).toHaveLength(18);
    expect(
      candidates.filter(
        (template) => template.source === "ugc_discovery_patterns",
      ),
    ).toHaveLength(12);
    expect(
      candidates.filter(
        (template) => template.source !== "ugc_discovery_patterns",
      ),
    ).toHaveLength(6);
  });

  it("assigns ten Batch tasks distinct, opener-balanced winner lanes", () => {
    const expectedFamilyIndexes = [0, 1, 2, 1, 0, 1, 2, 2, 0, 1];
    const firstCandidates = Array.from({ length: 10 }, (_, index) => {
      const variationSeed = `stitchr-batch:run:${index + 1}`;
      const candidates = selectStitchrHookCandidates({
        clipContexts: [],
        product,
        templates: cliprHookTemplates,
        variationSeed,
      });
      const discoveryCandidates = candidates.filter(
        (template) => template.source === "ugc_discovery_patterns",
      );
      const openerKeys = discoveryCandidates.map((template) => {
        const coordinates = getUgcDiscoveryHookCoordinates(template.id);

        return `${coordinates?.familyIndex}:${coordinates?.openerIndex}`;
      });
      const familyCounts = discoveryCandidates.reduce<Record<number, number>>(
        (counts, template) => {
          const familyIndex = getUgcDiscoveryHookCoordinates(
            template.id,
          )?.familyIndex;

          if (familyIndex !== undefined) {
            counts[familyIndex] = (counts[familyIndex] ?? 0) + 1;
          }

          return counts;
        },
        {},
      );

      expect(discoveryCandidates).toHaveLength(12);
      expect(new Set(openerKeys).size).toBe(12);
      expect(familyCounts).toEqual({ 0: 4, 1: 4, 2: 4 });

      return candidates[0];
    });

    expect(
      new Set(firstCandidates.map((candidate) => candidate?.id)).size,
    ).toBe(10);
    expect(
      firstCandidates.filter((candidate) =>
        candidate?.template.toLowerCase().startsWith("not me"),
      ),
    ).toHaveLength(1);
    expect(
      firstCandidates.map((candidate) =>
        candidate ? getUgcDiscoveryHookCoordinates(candidate.id) : null,
      ),
    ).toEqual(
      firstCandidates.map((_candidate, index) =>
        expect.objectContaining({
          familyIndex: expectedFamilyIndexes[index],
          openerIndex: index % 10,
        }),
      ),
    );
  });

  it(
    "covers every family and opener coordinate across thirty lanes",
    () => {
      const coordinateKeys = Array.from({ length: 30 }, (_, index) => {
        const candidates = selectStitchrHookCandidates({
          clipContexts: [],
          product,
          templates: cliprHookTemplates,
          variationSeed: `stitchr-seed:${index + 1}`,
        });
        const coordinates = getUgcDiscoveryHookCoordinates(
          candidates[0]?.id ?? "",
        );

        return `${coordinates?.familyIndex}:${coordinates?.openerIndex}`;
      });

      expect(new Set(coordinateKeys).size).toBe(30);
    },
    15_000,
  );
});
