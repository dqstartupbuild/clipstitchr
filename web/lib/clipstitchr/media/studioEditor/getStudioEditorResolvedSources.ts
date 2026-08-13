import { getStudioEditorSourceIdentity } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceIdentity";
import { getStudioEditorSourceRefFromDescriptor } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceRefFromDescriptor";
import type { StudioEditorResolvedSource } from "@/lib/clipstitchr/types/StudioEditorResolvedSource";
import type { StudioEditorMediaSourceCatalog } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceCatalog";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

export function getStudioEditorResolvedSources(
  project: StudioEditorProjectV1,
  catalog: StudioEditorMediaSourceCatalog,
) {
  const descriptorByIdentity = new Map(
    [...catalog.videoClips, ...catalog.stitches].map((descriptor) => {
      const source = getStudioEditorSourceRefFromDescriptor(descriptor);
      return [getStudioEditorSourceIdentity(source), descriptor] as const;
    }),
  );
  const resolvedByIdentity = new Map<string, StudioEditorResolvedSource>();

  for (const scene of project.scenes) {
    for (const track of scene.tracks) {
      for (const layer of track.layers) {
        if (!("source" in layer)) {
          continue;
        }

        const identity = getStudioEditorSourceIdentity(layer.source);

        if (resolvedByIdentity.has(identity)) {
          continue;
        }

        if (layer.source.kind === "studioUpload") {
          resolvedByIdentity.set(identity, {
            identity,
            source: layer.source,
            objectKey: layer.source.objectKey,
            name: layer.name,
          });
          continue;
        }

        const descriptor = descriptorByIdentity.get(identity);

        if (descriptor) {
          resolvedByIdentity.set(identity, {
            identity,
            source: layer.source,
            objectKey: descriptor.objectKey,
            name: descriptor.name,
          });
        }
      }
    }
  }

  return [...resolvedByIdentity.values()];
}
