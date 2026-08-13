"use client";

import { useMemo, useState } from "react";
import { StudioClipsCreateForm } from "./StudioClipsCreateForm";
import { StudioClipsProviderNotice } from "./StudioClipsProviderNotice";
import { StudioClipsState } from "./StudioClipsState";
import { StudioClipsTaskDetailView } from "./StudioClipsTaskDetailView";
import { StudioClipsTaskHistory } from "./StudioClipsTaskHistory";
import { clearArchivedStudioClipsTask } from "./clearArchivedStudioClipsTask";
import { selectCreatedStudioClipsTask } from "./selectCreatedStudioClipsTask";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import { getStudioClipsTaskIsActive } from "@/lib/clipstitchr/hooks/studioClips/getStudioClipsTaskIsActive";
import { useStudioClipsTaskDetail } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsTaskDetail";
import { useStudioClipsTasks } from "@/lib/clipstitchr/hooks/studioClips/useStudioClipsTasks";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsWorkspaceProps = {
  capabilities: StudioClipsCapabilities;
  productId: string;
};

export function StudioClipsWorkspace({
  capabilities,
  productId,
}: StudioClipsWorkspaceProps) {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const history = useStudioClipsTasks(productId, includeArchived);
  const activeTaskId = useMemo(
    () => history.tasks?.find((task) => getStudioClipsTaskIsActive(task.status))?.id ?? null,
    [history.tasks],
  );
  const activeRenderTask = useMemo(
    () => history.tasks?.find((task) => task.activeRenderRevision) ?? null,
    [history.tasks],
  );
  const activeWorkId =
    activeTaskId ?? activeRenderTask?.activeRenderRevision?.id ?? null;
  const resolvedTaskId =
    selectedTaskId && history.tasks?.some((task) => task.id === selectedTaskId)
      ? selectedTaskId
      : activeTaskId ?? activeRenderTask?.id ?? history.tasks?.[0]?.id ?? null;
  const detail = useStudioClipsTaskDetail(productId, resolvedTaskId);

  return (
    <div className={styles.workspace}>
      <StudioClipsProviderNotice capabilities={capabilities} />
      <div className={styles.workbench}>
        <StudioClipsCreateForm
          activeWorkId={activeWorkId}
          capabilities={capabilities}
          isTaskHistoryLoading={history.tasks === null}
          onCreated={(task) => selectCreatedStudioClipsTask(task, setSelectedTaskId, history.reload)}
          productId={productId}
        />
        <div className={styles.inspectionDesk}>
          {!resolvedTaskId ? (
            <StudioClipsState
              message="Save a task request or choose one from the history below."
              title="No task selected"
            />
          ) : detail.error ? (
            <StudioClipsState
              actionLabel="Try again"
              message={detail.error}
              onAction={detail.reload}
              title="This task did not open"
            />
          ) : detail.isMissing ? (
            <StudioClipsState
              message="It may have been removed from this Product's history. Choose another task below."
              title="This task is no longer available"
            />
          ) : detail.isLoading || !detail.task ? (
            <StudioClipsState
              message="Reading progress, evidence, candidates, and saved outputs."
              title="Opening task detail"
            />
          ) : (
            <StudioClipsTaskDetailView
              capabilities={capabilities}
              hasActiveProductWork={Boolean(activeWorkId)}
              onArchived={() => clearArchivedStudioClipsTask(setSelectedTaskId, history.reload)}
              onUpdated={history.reload}
              productId={productId}
              task={detail.task}
            />
          )}
        </div>
      </div>
      <StudioClipsTaskHistory
        error={history.error}
        includeArchived={includeArchived}
        onIncludeArchivedChange={setIncludeArchived}
        onSelect={setSelectedTaskId}
        selectedTaskId={resolvedTaskId}
        tasks={history.tasks}
      />
    </div>
  );
}
