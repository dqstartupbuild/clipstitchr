import { LazyReelRunButton } from "./LazyReelRunButton";
import type { LazyReelGetStatusRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelGetStatusRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelStatusFormProps = {
  isRunning: boolean;
  onSubmit: (request: LazyReelGetStatusRequest) => Promise<void>;
};

export function LazyReelStatusForm({
  isRunning,
  onSubmit,
}: LazyReelStatusFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({ tool: "get_status" });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Corpus status</h2>
        <p>
          Inspect the snapshot version, available tools, workflow planners, and
          the counts that can be verified from committed source material.
        </p>
      </div>
      <LazyReelRunButton idleLabel="Read corpus status" isRunning={isRunning} />
    </form>
  );
}
