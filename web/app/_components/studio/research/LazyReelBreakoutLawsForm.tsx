import { LazyReelRunButton } from "./LazyReelRunButton";
import type { LazyReelBreakoutLawsRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelBreakoutLawsRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelBreakoutLawsFormProps = {
  isRunning: boolean;
  onSubmit: (request: LazyReelBreakoutLawsRequest) => Promise<void>;
};

export function LazyReelBreakoutLawsForm({
  isRunning,
  onSubmit,
}: LazyReelBreakoutLawsFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit({ tool: "breakout_laws" });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Breakout laws</h2>
        <p>
          Read the strongest repeated findings, the contrast tests behind them,
          and every caveat that limits the claim.
        </p>
      </div>
      <p className={styles.jobNotice}>
        This is a fixed-snapshot analysis. It does not claim live market data.
      </p>
      <LazyReelRunButton idleLabel="Open breakout findings" isRunning={isRunning} />
    </form>
  );
}
