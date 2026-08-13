import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function getStudioEditorActiveScene(project: StudioEditorProjectV1) {
  const scene = project.scenes.find(
    (candidate) => candidate.id === project.activeSceneId,
  );

  if (!scene) {
    throw new Error("The active Studio scene is missing.");
  }

  return scene;
}
