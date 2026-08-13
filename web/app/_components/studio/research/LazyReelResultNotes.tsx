import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResultNotesProps = {
  limitations: string[];
  methodology: string;
};

export function LazyReelResultNotes({
  limitations,
  methodology,
}: LazyReelResultNotesProps) {
  return (
    <section className={styles.resultNotes} aria-label="Method and limits">
      <details>
        <summary>How this was worked out</summary>
        <p>{methodology}</p>
      </details>
      <details>
        <summary>What this cannot prove</summary>
        {limitations.length > 0 ? (
          <ul>
            {limitations.map((limitation, index) => (
              <li key={`${limitation}-${index}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p>No additional limitations were recorded.</p>
        )}
      </details>
    </section>
  );
}
