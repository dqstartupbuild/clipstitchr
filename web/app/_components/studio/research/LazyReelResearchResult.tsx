import { LazyReelEvidenceList } from "./LazyReelEvidenceList";
import { LazyReelExampleList } from "./LazyReelExampleList";
import { LazyReelResultLinks } from "./LazyReelResultLinks";
import { LazyReelResultNotes } from "./LazyReelResultNotes";
import { LazyReelResultSaveAction } from "./LazyReelResultSaveAction";
import { LazyReelResultSections } from "./LazyReelResultSections";
import { LazyReelWorkflowPlan } from "./LazyReelWorkflowPlan";
import { getLazyReelResultExamples } from "./getLazyReelResultExamples";
import type { LazyReelCompletedResearchJob } from "@/lib/clipstitchr/types/lazyreel/LazyReelCompletedResearchJob";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchResultProps = {
  completedJob: LazyReelCompletedResearchJob;
  productId: string;
  snapshotVersion: string;
};

export function LazyReelResearchResult({
  completedJob,
  productId,
  snapshotVersion,
}: LazyReelResearchResultProps) {
  const { result } = completedJob;
  const examples = getLazyReelResultExamples(result.data);

  return (
    <article className={styles.result} aria-labelledby="lazyreel-result-title">
      <header className={styles.resultHeader}>
        <div>
          <p>{completedJob.kind === "tool" ? "Research result" : "Planning result"}</p>
          <h2 id="lazyreel-result-title">{result.title}</h2>
          <span>{result.summary}</span>
        </div>
        <LazyReelResultSaveAction
          completedJob={completedJob}
          productId={productId}
          snapshotVersion={snapshotVersion}
        />
      </header>
      {completedJob.kind === "workflow" ? (
        <LazyReelWorkflowPlan data={completedJob.result.data} />
      ) : null}
      <LazyReelEvidenceList evidence={result.evidence} />
      <LazyReelExampleList examples={examples} />
      <LazyReelResultSections sections={result.sections} />
      <LazyReelResultLinks links={result.links} />
      <LazyReelResultNotes
        limitations={result.limitations}
        methodology={result.methodology}
      />
    </article>
  );
}
