import { LazyReelRunButton } from "./LazyReelRunButton";
import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";
import type { LazyReelWorkflowKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowKey";
import type { LazyReelWorkflowRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelWorkflowFormProps = {
  definition?: LazyReelWorkflowDefinition;
  isRunning: boolean;
  onSubmit: (request: LazyReelWorkflowRequest) => Promise<void>;
  productName: string;
  workflow: LazyReelWorkflowKey;
};

export function LazyReelWorkflowForm({
  definition,
  isRunning,
  onSubmit,
  productName,
  workflow,
}: LazyReelWorkflowFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        void onSubmit({
          workflow,
          brief: String(data.get("brief") ?? "").trim(),
          product: productName,
          targetDurationSeconds: Number(data.get("duration") ?? 20),
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>{definition?.title ?? "Production planner"}</h2>
        <p>{definition?.purpose ?? "Prepare a structured production plan from your brief."}</p>
      </div>
      <p className={styles.jobNotice}>
        Plan only: this produces stages and a manifest. It does not call a
        rendering provider or create media.
      </p>
      <label>
        Creative brief or direction
        <textarea
          disabled={isRunning}
          maxLength={8_000}
          name="brief"
          placeholder="Describe the audience, hook, proof, footage, and ending"
          required
          rows={9}
        />
      </label>
      <label>
        Target duration in seconds
        <input
          defaultValue={20}
          disabled={isRunning}
          max={180}
          min={5}
          name="duration"
          type="number"
        />
      </label>
      {definition ? (
        <details className={styles.workflowSourceNotes}>
          <summary>What this planner needs</summary>
          <ul>
            {definition.inputs.map((input) => <li key={input}>{input}</li>)}
          </ul>
        </details>
      ) : null}
      <LazyReelRunButton idleLabel="Build production plan" isRunning={isRunning} />
    </form>
  );
}
