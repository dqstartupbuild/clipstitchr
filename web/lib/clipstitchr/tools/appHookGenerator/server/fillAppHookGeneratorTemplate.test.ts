import { describe, expect, it } from "vitest";
import { fillAppHookGeneratorTemplate } from "@/lib/clipstitchr/tools/appHookGenerator/server/fillAppHookGeneratorTemplate";

const input = {
  appName: "ClipStitchr",
  audience: "app founders",
  desiredOutcome: "launch more ad ideas",
  edgeLevel: "safe" as const,
  problem: "editing every ad by hand",
  variationIndex: 0,
};

describe("fillAppHookGeneratorTemplate", () => {
  it("keeps a noun-phrase outcome grammatical", () => {
    expect(
      fillAppHookGeneratorTemplate(
        {
          allowedPurposes: ["swipr"],
          source: "app_hook_library",
          styleKey: "mystery_gap",
          template: "{{product_name}} for people who {{habit}}",
          templateId: "APP-051",
        },
        {
          ...input,
          appName: "NestEgg",
          desiredOutcome: "reliable investment planning",
        },
      ),
    ).toBe(
      "NestEgg for people who want this result: reliable investment planning",
    );
  });

  it("fails closed when the catalog contains an unknown placeholder", () => {
    expect(() =>
      fillAppHookGeneratorTemplate(
        {
          allowedPurposes: ["swipr"],
          source: "app_hook_library",
          styleKey: "mystery_gap",
          template: "Try {{unknown_catalog_field}}",
          templateId: "TEST-UNKNOWN",
        },
        input,
      ),
    ).toThrow("App Hook Generator catalog is incomplete.");
  });
});
