import type { CreateStudioEditorProjectV1Input } from "../../types/studioEditor/CreateStudioEditorProjectV1Input";
import type { StudioEditorProjectV1 } from "../../types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorProjectV1 } from "./assertStudioEditorProjectV1";
import { createDefaultStudioEditorCanvas } from "./createDefaultStudioEditorCanvas";
import { STUDIO_EDITOR_PROJECT_VERSION } from "./studioEditorProjectVersion";

export function createStudioEditorProjectV1(
  input: CreateStudioEditorProjectV1Input,
): StudioEditorProjectV1 {
  const project: StudioEditorProjectV1 = {
    version: STUDIO_EDITOR_PROJECT_VERSION,
    id: input.id,
    productId: input.productId,
    name: input.name,
    canvas: input.canvas ?? createDefaultStudioEditorCanvas(),
    activeSceneId: input.sceneId,
    scenes: [
      {
        id: input.sceneId,
        name: "Main scene",
        isMain: true,
        tracks: [
          {
            id: input.visualTrackId,
            name: "Visuals",
            kind: "visual",
            hidden: false,
            muted: false,
            locked: false,
            layers: [],
          },
          {
            id: input.audioTrackId,
            name: "Audio",
            kind: "audio",
            hidden: false,
            muted: false,
            locked: false,
            layers: [],
          },
          {
            id: input.captionTrackId,
            name: "Captions",
            kind: "caption",
            hidden: false,
            muted: false,
            locked: false,
            layers: [],
          },
        ],
      },
    ],
  };

  assertStudioEditorProjectV1(project);
  return project;
}
