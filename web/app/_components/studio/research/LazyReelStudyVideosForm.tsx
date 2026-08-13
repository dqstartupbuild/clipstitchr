import { LazyReelRunButton } from "./LazyReelRunButton";
import { readOptionalLazyReelFormValue } from "./readOptionalLazyReelFormValue";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import type { LazyReelStudyVideosRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelStudyVideosRequest";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelStudyVideosFormProps = {
  catalog: LazyReelResearchCatalog | null;
  isRunning: boolean;
  onSubmit: (request: LazyReelStudyVideosRequest) => Promise<void>;
};

export function LazyReelStudyVideosForm({
  catalog,
  isRunning,
  onSubmit,
}: LazyReelStudyVideosFormProps) {
  return (
    <form
      className={styles.jobForm}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        void onSubmit({
          tool: "study_videos",
          query: readOptionalLazyReelFormValue(data, "query"),
          niche: readOptionalLazyReelFormValue(data, "niche"),
          videoFormat: readOptionalLazyReelFormValue(data, "videoFormat"),
          hookPattern: readOptionalLazyReelFormValue(data, "hookPattern"),
          limit: Number(data.get("limit") ?? 12),
        });
      }}
    >
      <div className={styles.formIntroduction}>
        <h2>Study videos</h2>
        <p>
          Search the committed example set. Results keep their source links and
          corpus-backed notes.
        </p>
      </div>
      <label>
        Search words
        <input
          disabled={isRunning}
          maxLength={160}
          name="query"
          placeholder="A hook, product, emotion, or phrase"
        />
      </label>
      <div className={styles.formPair}>
        <label>
          Niche
          <select defaultValue="" disabled={isRunning} name="niche">
            <option value="">Any niche</option>
            {catalog?.niches.map((niche) => (
              <option key={niche} value={niche}>{niche}</option>
            ))}
          </select>
        </label>
        <label>
          Format
          <select defaultValue="" disabled={isRunning} name="videoFormat">
            <option value="">Any format</option>
            {catalog?.formats.map((format) => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.formPair}>
        <label>
          Hook pattern
          <select defaultValue="" disabled={isRunning} name="hookPattern">
            <option value="">Any hook</option>
            {catalog?.hookPatterns.map((pattern) => (
              <option key={pattern.id} value={pattern.name}>{pattern.name}</option>
            ))}
          </select>
        </label>
        <label>
          Result limit
          <input
            defaultValue={12}
            disabled={isRunning}
            max={20}
            min={1}
            name="limit"
            type="number"
          />
        </label>
      </div>
      <LazyReelRunButton idleLabel="Search examples" isRunning={isRunning} />
    </form>
  );
}
