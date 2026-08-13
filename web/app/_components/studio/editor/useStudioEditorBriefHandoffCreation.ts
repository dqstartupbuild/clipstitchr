"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import type { FormEvent } from "react";
import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createStudioEditorBriefHandoffProject } from "./createStudioEditorBriefHandoffProject";
import { serializeStudioEditorProjectSnapshot } from "@/lib/clipstitchr/studio/editor/serializeStudioEditorProjectSnapshot";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";

export function useStudioEditorBriefHandoffCreation(
  brief: Doc<"studioLazyReelCreativeBriefs"> | null | undefined,
  sources: StudioEditorMediaSourceDescriptor[],
  productId: string,
  onOpen: (projectId: string) => void,
) {
  const create = useMutation(api.studioEditorProjects.create.create);
  const [selectedSourceKey, setSelectedSourceKey] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creationInFlight = useRef(false);

  return {
    error,
    isCreating,
    selectedSourceKey,
    setSelectedSourceKey,
    submit: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (creationInFlight.current) {
        return;
      }

      const source = sources.find(
        (candidate) =>
          `${candidate.kind}:${candidate.id}` === selectedSourceKey,
      );
      if (!brief || !source) {
        setError("Choose one Product video before starting the edit.");
        return;
      }

      creationInFlight.current = true;
      setIsCreating(true);
      setError(null);

      try {
        const project = createStudioEditorBriefHandoffProject({
          briefTitle: brief.title,
          productId,
          source,
        });
        await create({
          id: project.id,
          idempotencyKey: `brief-handoff-${project.id}`,
          name: project.name,
          productId,
          snapshotJson: serializeStudioEditorProjectSnapshot(project),
        });
        onOpen(project.id);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "This brief could not start an edit.",
        );
      } finally {
        creationInFlight.current = false;
        setIsCreating(false);
      }
    },
  } as const;
}
