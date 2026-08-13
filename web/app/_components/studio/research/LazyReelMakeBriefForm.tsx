import { LazyReelRunButton } from "./LazyReelRunButton";
import { readOptionalLazyReelFormValue } from "./readOptionalLazyReelFormValue";
import type { LazyReelMakeBriefMode } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefMode";
import type { LazyReelMakeBriefRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefRequest";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelMakeBriefFormProps = {
  catalog: LazyReelResearchCatalog | null;
  isRunning: boolean;
  onSubmit: (request: LazyReelMakeBriefRequest) => Promise<void>;
  productName: string;
};

export function LazyReelMakeBriefForm({
  catalog,
  isRunning,
  onSubmit,
  productName,
}: LazyReelMakeBriefFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        void onSubmit({
          tool: "make_brief",
          product: productName,
          audience: readOptionalLazyReelFormValue(data, "audience"),
          objective: readOptionalLazyReelFormValue(data, "objective"),
          niche: readOptionalLazyReelFormValue(data, "niche"),
          framework: readOptionalLazyReelFormValue(data, "framework"),
          mode: String(data.get("mode") ?? "brief") as LazyReelMakeBriefMode,
          count: Number(data.get("count") ?? 3),
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Make a brief</h2>
        <p>
          The server grounds every idea in {productName}&apos;s saved Product
          facts. Reference material can shape pacing, never product claims.
        </p>
      </div>
      <div className={styles.formPair}>
        <label>
          Deliverable
          <select defaultValue="brief" disabled={isRunning} name="mode">
            <option value="brief">Full creative brief</option>
            <option value="ideas">Concept ideas</option>
            <option value="hooks">Hooks only</option>
          </select>
        </label>
        <label>
          Number of directions
          <input
            defaultValue={3}
            disabled={isRunning}
            max={10}
            min={1}
            name="count"
            type="number"
          />
        </label>
      </div>
      <label>
        Audience
        <input
          disabled={isRunning}
          maxLength={500}
          name="audience"
          placeholder="Who should recognize themselves in this?"
        />
      </label>
      <label>
        Objective
        <textarea
          disabled={isRunning}
          maxLength={1_000}
          name="objective"
          placeholder="What should the viewer understand or do?"
          rows={4}
        />
      </label>
      <div className={styles.formPair}>
        <label>
          Niche
          <select defaultValue="" disabled={isRunning} name="niche">
            <option value="">Choose the closest match</option>
            {catalog?.niches.map((niche) => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </label>
        <label>
          Framework
          <select defaultValue="" disabled={isRunning} name="framework">
            <option value="">Let the evidence choose</option>
            {catalog?.frameworks.map((framework) => (
              <option key={framework.id} value={framework.id}>
                {framework.name} ({framework.acronym})
              </option>
            ))}
          </select>
        </label>
      </div>
      <LazyReelRunButton idleLabel="Write grounded brief" isRunning={isRunning} />
    </form>
  );
}
