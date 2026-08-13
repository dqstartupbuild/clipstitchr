import type { StudioEditorProjectV1 } from "../../lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";
import { assertStudioEditorUploadObjectKey } from "./assertStudioEditorUploadObjectKey";

export function assertStudioEditorProjectUploadScope(
  project: StudioEditorProjectV1,
  ownerId: string,
  productId: string,
): void {
  for (const scene of project.scenes) {
    for (const track of scene.tracks) {
      for (const layer of track.layers) {
        if (
          "source" in layer &&
          layer.source.kind === "studioUpload"
        ) {
          assertStudioEditorUploadObjectKey(
            layer.source.objectKey,
            ownerId,
            productId,
          );
        }
      }
    }
  }
}
