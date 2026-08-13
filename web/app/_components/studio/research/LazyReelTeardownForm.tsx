"use client";

import { useState } from "react";
import { LazyReelRunButton } from "./LazyReelRunButton";
import { readOptionalLazyReelFormValue } from "./readOptionalLazyReelFormValue";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import type { LazyReelTeardownRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelTeardownRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelTeardownFormProps = {
  catalog: LazyReelResearchCatalog | null;
  isRunning: boolean;
  onSubmit: (request: LazyReelTeardownRequest) => Promise<void>;
  productName: string;
};

export function LazyReelTeardownForm({
  catalog,
  isRunning,
  onSubmit,
  productName,
}: LazyReelTeardownFormProps) {
  const [mode, setMode] = useState<"reference" | "product">("reference");

  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        void onSubmit({
          tool: "teardown",
          video:
            mode === "reference"
              ? readOptionalLazyReelFormValue(data, "video")
              : undefined,
          product: mode === "product" ? productName : undefined,
          niche: readOptionalLazyReelFormValue(data, "niche"),
          trend:
            mode === "product"
              ? readOptionalLazyReelFormValue(data, "trend")
              : undefined,
          model: readOptionalLazyReelFormValue(
            data,
            "model",
          ) as LazyReelTeardownRequest["model"],
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Format teardown</h2>
        <p>
          Study a reference as evidence, or map a corpus trend onto your saved
          Product without inventing claims.
        </p>
      </div>
      <fieldset className={styles.choiceFieldset}>
        <legend>Teardown source</legend>
        <label>
          <input
            checked={mode === "reference"}
            disabled={isRunning}
            name="teardownMode"
            onChange={() => setMode("reference")}
            type="radio"
            value="reference"
          />
          Description, transcript, or public link
        </label>
        <label>
          <input
            checked={mode === "product"}
            disabled={isRunning}
            name="teardownMode"
            onChange={() => setMode("product")}
            type="radio"
            value="product"
          />
          Product and trend
        </label>
      </fieldset>
      {mode === "reference" ? (
        <label>
          Reference material
          <textarea
            disabled={isRunning}
            maxLength={8_000}
            name="video"
            placeholder="Paste a transcript, describe the video, or add a supported public URL"
            required
            rows={7}
          />
        </label>
      ) : (
        <label>
          Trend or format to borrow
          <input
            disabled={isRunning}
            maxLength={160}
            name="trend"
            placeholder="Name a trend, format, or pattern"
            required
          />
        </label>
      )}
      <div className={styles.formPair}>
        <label>
          Niche
          <select defaultValue="" disabled={isRunning} name="niche">
            <option value="">Use the closest corpus match</option>
            {catalog?.niches.map((niche) => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </label>
        <label>
          Video model
          <select defaultValue="higgsfield" disabled={isRunning} name="model">
            <option value="higgsfield">Higgsfield</option>
            <option value="seedance">Seedance</option>
            <option value="kling">Kling</option>
            <option value="veo">Veo</option>
          </select>
        </label>
      </div>
      <LazyReelRunButton idleLabel="Build teardown" isRunning={isRunning} />
    </form>
  );
}
