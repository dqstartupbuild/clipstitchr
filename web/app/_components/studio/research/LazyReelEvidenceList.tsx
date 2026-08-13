import type { LazyReelEvidence } from "@/lib/clipstitchr/types/lazyreel/LazyReelEvidence";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelEvidenceList({ evidence }: { evidence: LazyReelEvidence[] }) {
  if (evidence.length === 0) {
    return null;
  }

  return (
    <section className={styles.evidenceSection} aria-labelledby="lazyreel-evidence">
      <h3 id="lazyreel-evidence">Evidence ledger</h3>
      <ul className={styles.evidenceList}>
        {evidence.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.kind === "observed" ? "Observed" : item.kind === "derived" ? "Derived" : "Heuristic"}</span>
            </div>
            <p>{item.detail}</p>
            <small>
              {item.source}{typeof item.sample === "number" ? ` · sample ${item.sample}` : ""}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
