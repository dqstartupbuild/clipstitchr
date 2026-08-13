import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";

export function getStudioEditorScene(
  project: StudioEditorProjectV1,
  sceneId: string,
) {
  const scene = project.scenes.find((candidate) => candidate.id === sceneId);
  if (!scene) {
    throw new Error(`Studio editor scene not found: ${sceneId}`);
  }
  return scene;
}
