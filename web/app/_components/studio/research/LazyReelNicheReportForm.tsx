"use client";

import { useState } from "react";
import { LazyReelRunButton } from "./LazyReelRunButton";
import type { LazyReelNicheReportFocus } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportFocus";
import type { LazyReelNicheReportRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportRequest";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelNicheReportFormProps = {
  catalog: LazyReelResearchCatalog | null;
  isRunning: boolean;
  onSubmit: (request: LazyReelNicheReportRequest) => Promise<void>;
};

export function LazyReelNicheReportForm({
  catalog,
  isRunning,
  onSubmit,
}: LazyReelNicheReportFormProps) {
  const [focus, setFocus] = useState<LazyReelNicheReportFocus>("overview");
  const requiresNiche = focus === "overview" || focus === "format" || focus === "combos";

  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const niche = String(data.get("niche") ?? "").trim();
        const focus = String(data.get("focus") ?? "overview") as LazyReelNicheReportFocus;
        const limit = Number(data.get("limit") ?? 12);

        void onSubmit({
          tool: "niche_report",
          niche: niche || undefined,
          focus,
          limit,
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Niche report</h2>
        <p>
          Compare openings, formats, and opportunity gaps against the current
          corpus snapshot.
        </p>
      </div>
      <label>
        Niche or category
        <input
          disabled={isRunning}
          list="lazyreel-niches"
          maxLength={120}
          name="niche"
          placeholder="Try fitness, education, or finance"
          required={requiresNiche}
        />
      </label>
      <datalist id="lazyreel-niches">
        {catalog?.niches.map((niche) => <option key={niche} value={niche} />)}
      </datalist>
      <div className={styles.formPair}>
        <label>
          What to inspect
          <select
            disabled={isRunning}
            name="focus"
            onChange={(event) => setFocus(event.target.value as LazyReelNicheReportFocus)}
            value={focus}
          >
            <option value="overview">Full overview</option>
            <option value="format">Formats</option>
            <option value="trends">Trends</option>
            <option value="combos">Combinations</option>
            <option value="apps">App patterns</option>
          </select>
        </label>
        <label>
          Example limit
          <input
            defaultValue={12}
            disabled={isRunning}
            max={18}
            min={1}
            name="limit"
            type="number"
          />
        </label>
      </div>
      <LazyReelRunButton idleLabel="Build niche report" isRunning={isRunning} />
    </form>
  );
}
