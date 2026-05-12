import { describe, expect, it } from "vitest";
import { createCliprScenePrompt } from "@/lib/clipstitchr/server/createCliprScenePrompt";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

const scene: CliprScenePlan = {
  id: "scene-1",
  index: 0,
  sceneType: "avatar",
  scriptText: "This is the line that will become voiceover later.",
  visualPrompt: "Medium shot in natural light.",
  estimatedDurationSeconds: 8,
};

describe("createCliprScenePrompt", () => {
  it("uses avatar scene images for silent visual animation", () => {
    const prompt = createCliprScenePrompt(scene);

    expect(prompt).toContain("Animate the input image");
    expect(prompt).toContain("Generate silent visuals only");
    expect(prompt).toContain("Voiceover context");
    expect(prompt).toContain("Do not create speech");
    expect(prompt).not.toContain("Script: \"");
  });
});
