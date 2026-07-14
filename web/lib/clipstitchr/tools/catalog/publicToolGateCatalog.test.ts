import { describe, expect, it } from "vitest";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { getPublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMode";
import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { publicToolGateCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolGateCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";

const approvedKeysByMode = {
  "open-result": [
    "what-should-i-post-decision-tree",
    "9-16-app-demo-video-checker",
    "app-ad-dead-space-finder",
    "tiktok-safe-zone-overlay",
    "app-video-compression-estimator",
    "short-form-video-specs-cheat-sheet",
    "clip-naming-system-generator",
    "ad-variant-calculator",
    "app-ad-creative-fatigue-calculator",
    "app-ugc-cost-calculator",
    "app-ad-cost-per-creative-calculator",
    "app-ad-break-even-calculator",
    "app-ad-testing-budget-planner",
    "ugc-creator-rate-comparison-worksheet",
    "client-content-capacity-calculator",
    "clipstitchr-savings-report",
  ],
  "useful-preview": [
    "30-day-app-content-plan",
    "app-ad-shot-list-generator",
    "app-hook-generator",
    "app-ad-hook-grader",
    "app-ad-hook-rewriter",
    "hook-to-visual-matchmaker",
    "product-demo-readiness-checker",
    "app-ugc-clip-readiness-checker",
    "app-ad-test-plan-generator",
    "personalized-short-form-content-audit",
    "app-ugc-brief-builder",
    "app-ad-creative-testing-blueprint-builder",
    "raw-clips-to-campaign-planner",
  ],
  "gated-portability": [
    "100-app-demo-video-hooks",
    "app-ugc-ad-brief-template",
    "app-demo-recording-checklist",
    "tiktok-reels-creative-testing-tracker",
    "ugc-creator-handoff-kit",
    "app-marketing-content-calendar",
    "short-form-ad-preflight-checklist",
    "app-ad-hook-structures",
    "ugc-opening-line-prompt-cards",
    "app-category-hook-packs",
    "competitor-hook-research-worksheet",
    "app-hook-testing-matrix",
    "why-did-this-ad-work-template",
    "app-raw-footage-intake-checklist",
    "app-creative-asset-inventory-template",
    "short-form-campaign-retrospective-template",
    "short-form-content-system-notion-kit",
    "app-ad-teardown-library",
  ],
  "email-native": [
    "five-day-app-content-sprint",
    "ugc-to-app-ad-mini-course",
    "app-creative-testing-system-workshop",
  ],
} satisfies Record<PublicToolGateMode, readonly PublicToolKey[]>;

describe("publicToolGateCatalog", () => {
  it("assigns all fifty catalog keys exactly once", () => {
    const gateKeys = Object.keys(publicToolGateCatalog);

    expect(gateKeys).toHaveLength(50);
    expect(new Set(gateKeys)).toHaveLength(50);
    expect(new Set(gateKeys)).toEqual(new Set(publicToolKeys));
  });

  it.each(Object.entries(approvedKeysByMode))(
    "keeps the exact approved %s membership",
    (mode, approvedKeys) => {
      const actualKeys = publicToolKeys.filter(
        (key) => getPublicToolGateMode(key) === mode,
      );

      expect(actualKeys).toEqual(approvedKeys);
    },
  );

  it("keeps the approved 16/13/18/3 split", () => {
    expect(
      Object.fromEntries(
        Object.keys(approvedKeysByMode).map((mode) => [
          mode,
          publicToolKeys.filter(
            (key) => getPublicToolGateMode(key) === mode,
          ).length,
        ]),
      ),
    ).toEqual({
      "open-result": 16,
      "useful-preview": 13,
      "gated-portability": 18,
      "email-native": 3,
    });
  });

  it("provides specific public, unlocked, and outcome copy for every tool", () => {
    for (const key of publicToolKeys) {
      const metadata = getPublicToolGateMetadata(key);

      expect(metadata.value.publicValue.trim(), key).not.toBe("");
      expect(metadata.value.unlockedValue.trim(), key).not.toBe("");
      expect(metadata.outcomeCta.trim(), key).not.toBe("");
      expect(metadata.outcomeCta, key).not.toMatch(/^submit$/i);
    }
  });

  it("requires an artifact contract for every open-result and portability gate", () => {
    for (const key of publicToolKeys) {
      const metadata = getPublicToolGateMetadata(key);

      if (
        metadata.mode === "open-result" ||
        metadata.mode === "gated-portability"
      ) {
        expect(metadata.artifact.description.trim(), key).not.toBe("");
      }
    }
  });

  it("maps email-native tools to the three approved Workflow events", () => {
    expect(
      Object.fromEntries(
        approvedKeysByMode["email-native"].map((key) => {
          const metadata = getPublicToolGateMetadata(key);

          if (metadata.mode !== "email-native") {
            throw new Error(`Expected ${key} to be email-native.`);
          }

          return [key, metadata.workflowKey];
        }),
      ),
    ).toEqual({
      "five-day-app-content-sprint": "five_day_content_sprint_enrolled",
      "ugc-to-app-ad-mini-course": "ugc_app_ad_course_enrolled",
      "app-creative-testing-system-workshop":
        "creative_testing_workshop_enrolled",
    });
  });
});
