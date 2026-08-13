import type { LazyReelWorkflowResultData } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResultData";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelWorkflowPlan({ data }: { data: LazyReelWorkflowResultData }) {
  return (
    <section className={styles.workflowPlan} aria-labelledby="lazyreel-workflow-plan">
      <h3 id="lazyreel-workflow-plan">Production plan</h3>
      <p>
        Plan only · {data.targetDurationSeconds} seconds · {data.stages.length} stages
      </p>
      <ol>
        {data.stages.map((stage, index) => (
          <li key={`${stage.name}-${index}`}>
            <strong>{stage.name}</strong>
            <span>{stage.instruction}</span>
          </li>
        ))}
      </ol>
      <details>
        <summary>Provider requirements</summary>
        <ul>
          {data.providerRequirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
