import { describe, expect, it } from "vitest";
import { createAvatarPhotoGenerationInput } from "@/lib/clipstitchr/server/createAvatarPhotoGenerationInput";
import { createCliprAvatarStillVariant } from "@/lib/clipstitchr/server/createCliprAvatarStillVariant";
import { createCliprAvatarVideoInput } from "@/lib/clipstitchr/server/createCliprAvatarVideoInput";
import { createProductEnrichmentPrompt } from "@/lib/clipstitchr/server/createProductEnrichmentPrompt";
import { parseProductEnrichmentOutputText } from "@/lib/clipstitchr/server/parseProductEnrichmentOutputText";
import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

describe("product enrichment and avatar generation helpers", () => {
  it("builds a product enrichment prompt with trimmed product context", () => {
    const prompt = createProductEnrichmentPrompt({
      audienceDetails: " creators ",
      name: " Launch Kit ",
      productDetails: " helps teams ship ads ",
    });

    expect(prompt).toContain("Infer hidden strategic metadata");
    expect(prompt).toContain("Available Clipr hook styles:");
    expect(prompt).toContain("Available Clipr template IDs:");
    expect(prompt).toContain("Product name: Launch Kit");
    expect(prompt).toContain("Product details: helps teams ship ads");
    expect(prompt).toContain("Audience details: creators");
  });

  it("parses fenced product enrichment JSON and filters unsupported values", () => {
    const styleKey = cliprHookStyles[0].styleKey;
    const template = cliprHookTemplates.find(
      (candidate) => candidate.requiredVariables.length > 0,
    );

    if (!template) {
      throw new Error("Expected a template with placeholders.");
    }

    const placeholderKey = template.requiredVariables[0];
    const output = parseProductEnrichmentOutputText(
      [
        "```json",
        JSON.stringify({
          cliprPlaceholderFillers: {
            [placeholderKey]: ["fast launch", "fast launch", "less editing"],
            unsupported_key: ["ignored"],
          },
          eligibleCliprHookStyleKeys: [styleKey, "missing_style"],
          eligibleCliprHookTemplateIds: [template.id, "missing_template"],
          inferredPainPoints: [" slow editing ", "slow editing", 42],
          problemSolved: "fallback problem",
        }),
        "```",
      ].join("\n"),
    );

    expect(output.inferredProblem).toBe("fallback problem");
    expect(output.inferredPainPoints).toEqual(["slow editing"]);
    expect(output.eligibleCliprHookStyleKeys).toEqual([styleKey]);
    expect(output.eligibleCliprHookTemplateIds).toEqual([template.id]);
    expect(output.cliprPlaceholderFillers).toEqual({
      [placeholderKey]: ["fast launch", "less editing"],
    });
  });

  it("returns an empty enrichment object for invalid output", () => {
    expect(parseProductEnrichmentOutputText("not json")).toEqual({
      cliprPlaceholderFillers: {},
      eligibleCliprHookStyleKeys: [],
      eligibleCliprHookTemplateIds: [],
      inferredPainPoints: [],
      inferredProblem: undefined,
    });
  });

  it("creates model-specific avatar photo generation inputs", () => {
    const image = { name: "avatar.jpg" } as File;

    expect(
      createAvatarPhotoGenerationInput({
        image,
        modelId: "minimax/image-01:version",
        prompt: "studio portrait",
        quality: "high",
      }),
    ).toEqual({
      aspect_ratio: "3:4",
      number_of_images: 1,
      prompt: "studio portrait",
      prompt_optimizer: false,
      subject_reference: image,
    });
    expect(
      createAvatarPhotoGenerationInput({
        image,
        modelId: "openai/gpt-image-2",
        prompt: "studio portrait",
        quality: "medium",
      }),
    ).toEqual({
      aspect_ratio: "2:3",
      background: "opaque",
      input_images: [image],
      moderation: "auto",
      number_of_images: 1,
      output_format: "jpeg",
      prompt: "studio portrait",
      quality: "medium",
    });
  });

  it("creates Clipr avatar still and video provider inputs", () => {
    const scene = {
      scriptText: "This is the launch workflow I use.",
      visualPrompt: "Creator at a desk with a laptop",
    } as CliprScenePlan;
    const stillVariant = createCliprAvatarStillVariant(scene);
    const videoInput = createCliprAvatarVideoInput({
      imageUrl: "https://example.com/avatar.jpg",
      script: "Try this before editing another ad.",
      voiceId: "Zephyr (Female)",
    });

    expect(stillVariant.locationDescription).toBe(
      "Creator at a desk with a laptop",
    );
    expect(stillVariant.poseDescription).toContain(scene.scriptText);
    expect(videoInput).toEqual(
      expect.objectContaining({
        disable_prompt_upsampling: true,
        image: "https://example.com/avatar.jpg",
        resolution: "720p",
        voice: "Zephyr (Female)",
        voice_language: "English (US)",
        voice_script: "Try this before editing another ad.",
      }),
    );
    expect(videoInput.video_prompt).toContain("talking-head video");
  });
});
