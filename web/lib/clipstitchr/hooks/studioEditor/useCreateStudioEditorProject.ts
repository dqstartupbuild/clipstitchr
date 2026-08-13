"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStudioEditorProjectV1 } from "@/lib/clipstitchr/studio/editor/createStudioEditorProjectV1";
import { serializeStudioEditorProjectSnapshot } from "@/lib/clipstitchr/studio/editor/serializeStudioEditorProjectSnapshot";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function useCreateStudioEditorProject(productId: string | undefined) {
  const create = useMutation(api.studioEditorProjects.create.create);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useCallback(
    async (requestedName: string) => {
      if (!productId) {
        throw new Error("Choose a Product before starting an edit.");
      }

      const name = requestedName.trim();

      if (!name) {
        throw new Error("Give this edit a name.");
      }

      setIsCreating(true);
      setError(null);

      try {
        const project = createStudioEditorProjectV1({
          id: createId(),
          productId,
          name,
          sceneId: createId(),
          visualTrackId: createId(),
          audioTrackId: createId(),
          captionTrackId: createId(),
        });

        await create({
          id: project.id,
          productId,
          name,
          idempotencyKey: `create-${project.id}`,
          snapshotJson: serializeStudioEditorProjectSnapshot(project),
        });

        return project.id;
      } catch (caught) {
        const message =
          caught instanceof Error ? caught.message : "Unable to start this edit.";
        setError(message);
        throw caught;
      } finally {
        setIsCreating(false);
      }
    },
    [create, productId],
  );

  return { createProject, error, isCreating };
}
