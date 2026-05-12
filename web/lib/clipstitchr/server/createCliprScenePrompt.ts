import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";

export function createCliprScenePrompt(scene: CliprScenePlan) {
  const referenceInstruction =
    scene.sceneType === "avatar"
      ? "Animate the input image as a natural UGC-style video shot while preserving the person's identity."
      : "Use simple b-roll visuals that support the idea without showing product promotion.";

  return [
    "Create one vertical 9:16 short-form engagement video scene.",
    referenceInstruction,
    "Generate silent visuals only. Do not create speech, captions, text overlays, app screens, logos, or readable UI.",
    "Use the script only as off-camera voiceover context.",
    "Keep the scene natural, non-promotional, and safe for a general audience.",
    `Voiceover context: ${scene.scriptText}`,
    `Visual direction: ${scene.visualPrompt}`,
  ].join("\n");
}
