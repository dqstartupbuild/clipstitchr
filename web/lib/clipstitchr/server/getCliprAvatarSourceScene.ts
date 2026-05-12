import type { CliprScenePlan } from "@/lib/clipstitchr/types/CliprScenePlan";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function getCliprAvatarSourceScene(
  scenePlan: CliprScenePlan[],
  script: string,
): CliprScenePlan {
  const sourceScene = scenePlan.find((scene) => scene.sceneType === "avatar") ??
    scenePlan[0] ?? {
      id: createId(),
      index: 0,
      sceneType: "avatar" as const,
      scriptText: script,
      visualPrompt:
        "Vertical talking-head UGC video, natural light, clear eye contact.",
      estimatedDurationSeconds: 8,
    };

  return {
    ...sourceScene,
    scriptText: script,
  };
}
