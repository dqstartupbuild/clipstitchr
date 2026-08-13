import type { LazyReelResultSection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResultSection";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelResultSections({ sections }: { sections: LazyReelResultSection[] }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <section className={styles.resultSections} aria-labelledby="lazyreel-findings">
      <h3 id="lazyreel-findings">Findings</h3>
      {sections.map((section, index) => (
        <details key={section.id} open={index === 0}>
          <summary>{section.title}</summary>
          <ul>
            {section.items.map((item, itemIndex) => (
              <li key={`${section.id}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
    </section>
  );
}
