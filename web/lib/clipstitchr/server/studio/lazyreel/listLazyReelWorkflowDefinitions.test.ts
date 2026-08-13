import { describe, expect, it } from "vitest";
import { listLazyReelWorkflowDefinitions } from "./listLazyReelWorkflowDefinitions";

describe("listLazyReelWorkflowDefinitions", () => {
  it("exposes all six structured workflows grounded in vendored skill references", () => {
    const definitions = listLazyReelWorkflowDefinitions();

    expect(definitions.map((item) => item.key)).toEqual([
      "format_deconstructor",
      "format_prompt_builder",
      "higgsfield_director",
      "ugc_ad_director",
      "ugc_ad_generator",
      "video_editor",
    ]);
    definitions.forEach((definition) => {
      expect(definition.stages.length).toBeGreaterThanOrEqual(4);
      expect(definition.sourceFiles[0]).toContain("skills/lazyreel-");
      expect(definition.outputSections.length).toBeGreaterThan(0);
      expect(JSON.parse(JSON.stringify(definition))).toEqual(definition);
    });
  });
});
