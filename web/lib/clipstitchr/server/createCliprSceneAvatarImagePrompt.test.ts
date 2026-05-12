import { describe, expect, it } from "vitest";
import { createCliprSceneAvatarImagePrompt } from "@/lib/clipstitchr/server/createCliprSceneAvatarImagePrompt";
import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

const scene: CliprScenePlan = {
  id: "scene-1",
  index: 0,
  sceneType: "avatar",
  scriptText: "Explain why random routines make progress hard to see.",
  visualPrompt: "Person in a small home workout space checking a notebook.",
  estimatedDurationSeconds: 8,
};

describe("createCliprSceneAvatarImagePrompt", () => {
  it("asks for a UGC-style still that fits the scene", () => {
    const prompt = createCliprSceneAvatarImagePrompt({
      avatarDescription: "Same person as the reference photo.",
      scene,
    });

    expect(prompt).toContain("UGC-style source photo");
    expect(prompt).toContain("preserve the same person's facial identity");
    expect(prompt).toContain(scene.scriptText);
    expect(prompt).toContain(scene.visualPrompt);
    expect(prompt).toContain("Do not include text");
  });
});
