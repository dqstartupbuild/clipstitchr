"use client";

import { useState } from "react";
import { LazyReelResearchJobPicker } from "./LazyReelResearchJobPicker";
import { LazyReelResearchResult } from "./LazyReelResearchResult";
import { LazyReelToolForm } from "./LazyReelToolForm";
import { LazyReelWorkflowForm } from "./LazyReelWorkflowForm";
import { selectLazyReelResearchJob } from "./selectLazyReelResearchJob";
import { useLazyReelJobRunner } from "@/lib/clipstitchr/hooks/lazyreel/useLazyReelJobRunner";
import type { LazyReelResearchCatalogResponse } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalogResponse";
import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchWorkbenchProps = {
  catalogResponse: LazyReelResearchCatalogResponse;
  productId: string;
  productName: string;
};

export function LazyReelResearchWorkbench({
  catalogResponse,
  productId,
  productName,
}: LazyReelResearchWorkbenchProps) {
  const [selection, setSelection] = useState<LazyReelResearchJobSelection>({
    kind: "tool",
    key: "niche_report",
  });
  const runner = useLazyReelJobRunner(productId);
  const workflowDefinition =
    selection.kind === "workflow"
      ? catalogResponse.workflows.find((item) => item.key === selection.key)
      : undefined;

  return (
    <div className={styles.workbench}>
      <LazyReelResearchJobPicker
        disabled={runner.isRunning}
        onSelect={(nextSelection) =>
          selectLazyReelResearchJob(
            nextSelection,
            runner.isRunning,
            setSelection,
            runner.reset,
          )
        }
        selection={selection}
      />
      <div className={styles.jobWorkspace}>
        {selection.kind === "tool" ? (
          <LazyReelToolForm
            catalog={catalogResponse.catalog}
            isRunning={runner.isRunning}
            onSubmit={runner.runTool}
            productName={productName}
            tool={selection.key}
          />
        ) : (
          <LazyReelWorkflowForm
            definition={workflowDefinition}
            isRunning={runner.isRunning}
            onSubmit={runner.runWorkflow}
            productName={productName}
            workflow={selection.key}
          />
        )}
        {runner.error ? (
          <p className={styles.jobError} role="alert">{runner.error}</p>
        ) : null}
        {runner.completedJob ? (
          <LazyReelResearchResult
            completedJob={runner.completedJob}
            productId={productId}
            snapshotVersion={catalogResponse.catalog.snapshotVersion}
          />
        ) : null}
      </div>
    </div>
  );
}
