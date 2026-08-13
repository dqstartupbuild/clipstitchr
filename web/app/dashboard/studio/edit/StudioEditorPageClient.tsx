"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { StudioEditorBriefHandoff } from "@/app/_components/studio/editor/StudioEditorBriefHandoff";
import { StudioEditorHeader } from "@/app/_components/studio/editor/StudioEditorHeader";
import { StudioEditorProjectLibrary } from "@/app/_components/studio/editor/StudioEditorProjectLibrary";
import { StudioEditorSourceHandoff } from "@/app/_components/studio/editor/StudioEditorSourceHandoff";
import { StudioEditorState } from "@/app/_components/studio/editor/StudioEditorState";
import { readStudioHandoffIdentifier } from "@/app/dashboard/studio/readStudioHandoffIdentifier";
import { closeStudioEditorHandoff } from "./closeStudioEditorHandoff";
import { openStudioEditorProject } from "./openStudioEditorProject";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import styles from "./studioEditor.module.css";

const StudioEditorProjectLoader = dynamic(
  () =>
    import("@/app/_components/studio/editor/StudioEditorProjectLoader").then(
      (module) => module.StudioEditorProjectLoader,
    ),
  {
    ssr: false,
    loading: () => (
      <StudioEditorState
        title="Opening the edit"
        message="Loading the timeline and browser media tools."
      />
    ),
  },
);

export function StudioEditorPageClient() {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const router = useRouter();
  const searchParams = useSearchParams();
  const briefId = readStudioHandoffIdentifier(searchParams.get("briefId"));
  const projectId = readStudioHandoffIdentifier(searchParams.get("projectId"));
  const sourceId = readStudioHandoffIdentifier(searchParams.get("sourceId"));
  return (
    <DashboardShell>
      <div className={styles.editorPage}>
        <StudioEditorHeader productName={activeProduct?.name ?? "Studio Product"} />
        {!activeProductId ? (
          <StudioEditorState
            title="Choose a Product first"
            message="Use the dashboard Product switcher to choose where this edit and its final video belong."
          />
        ) : projectId ? (
          <StudioEditorProjectLoader
            key={`${activeProductId}:${projectId}`}
            productId={activeProductId}
            projectId={projectId}
            onClose={() => closeStudioEditorHandoff(router.replace)}
          />
        ) : briefId ? (
          <StudioEditorBriefHandoff
            briefId={briefId}
            key={`${activeProductId}:${briefId}`}
            onCancel={() => closeStudioEditorHandoff(router.replace)}
            onOpen={(nextProjectId) => openStudioEditorProject(nextProjectId, router.replace)}
            productId={activeProductId}
          />
        ) : sourceId ? (
          <StudioEditorSourceHandoff
            key={`${activeProductId}:${sourceId}`}
            onCancel={() => closeStudioEditorHandoff(router.replace)}
            onOpen={(nextProjectId) => openStudioEditorProject(nextProjectId, router.replace)}
            productId={activeProductId}
            sourceId={sourceId}
          />
        ) : (
          <StudioEditorProjectLibrary
            key={activeProductId}
            productId={activeProductId}
            onOpen={(nextProjectId) => openStudioEditorProject(nextProjectId, router.replace)}
          />
        )}
      </div>
    </DashboardShell>
  );
}
