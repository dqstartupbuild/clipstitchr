import { LazyReelRunButton } from "./LazyReelRunButton";
import type { LazyReelKillTheSlopRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelKillTheSlopRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelKillTheSlopFormProps = {
  isRunning: boolean;
  onSubmit: (request: LazyReelKillTheSlopRequest) => Promise<void>;
};

export function LazyReelKillTheSlopForm({
  isRunning,
  onSubmit,
}: LazyReelKillTheSlopFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        void onSubmit({
          tool: "kill_the_slop",
          copy: String(data.get("copy") ?? "").trim(),
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Tighten copy</h2>
        <p>
          Find vague language, explain why it falls flat, and rebuild the hook
          with the corpus voice rules.
        </p>
      </div>
      <label>
        Draft copy
        <textarea
          disabled={isRunning}
          maxLength={4_000}
          name="copy"
          placeholder="Paste the hook, script opening, or ad copy you want to sharpen"
          required
          rows={9}
        />
      </label>
      <LazyReelRunButton idleLabel="Review and rewrite" isRunning={isRunning} />
    </form>
  );
}
