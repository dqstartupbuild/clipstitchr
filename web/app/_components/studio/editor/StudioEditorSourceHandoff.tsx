"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StudioEditorState } from "@/app/_components/studio/editor/StudioEditorState";
import { useStudioEditorSourceCatalog } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorSourceCatalog";
import { createStudioEditorProjectFromVideoSource } from "@/lib/clipstitchr/media/studioEditor/createStudioEditorProjectFromVideoSource";
import { serializeStudioEditorProjectSnapshot } from "@/lib/clipstitchr/studio/editor/serializeStudioEditorProjectSnapshot";

type StudioEditorSourceHandoffProps = {
  onCancel: () => void;
  onOpen: (projectId: string) => void;
  productId: string;
  sourceId: string;
};

export function StudioEditorSourceHandoff({
  onCancel,
  onOpen,
  productId,
  sourceId,
}: StudioEditorSourceHandoffProps) {
  const create = useMutation(api.studioEditorProjects.create.create);
  const catalog = useStudioEditorSourceCatalog(productId);
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const source = [
    ...catalog.catalog.videoClips,
    ...catalog.catalog.stitches,
  ].find((item) => item.id === sourceId);

  useEffect(() => {
    if (catalog.isLoading || catalog.error || !source || started.current) return;
    started.current = true;
    const project = createStudioEditorProjectFromVideoSource(productId, source);
    void create({
      id: project.id,
      idempotencyKey: `source-handoff-${project.id}`,
      name: project.name,
      productId,
      snapshotJson: serializeStudioEditorProjectSnapshot(project),
    })
      .then(() => onOpen(project.id))
      .catch((caught: unknown) => {
        started.current = false;
        setError(
          caught instanceof Error
            ? caught.message
            : "This clip could not open in the editor.",
        );
      });
  }, [catalog.error, catalog.isLoading, create, onOpen, productId, source]);

  if (sourceId.length > 120 || (!catalog.isLoading && !catalog.error && !source)) {
    return (
      <StudioEditorState
        actionLabel="Back to edits"
        message="This Product Library clip is unavailable. It may belong to another Product or account."
        onAction={onCancel}
        title="Clip not found"
      />
    );
  }
  if (catalog.error || error) {
    return (
      <StudioEditorState
        actionLabel="Try again"
        message={error ?? catalog.error ?? "This clip could not open."}
        onAction={() => {
          setError(null);
          started.current = false;
          void catalog.reload();
        }}
        title="The editor could not open this clip"
      />
    );
  }
  return (
    <StudioEditorState
      message="Building a new timeline with the accepted clip already in place."
      title="Opening your clip"
    />
  );
}
