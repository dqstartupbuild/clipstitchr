import { getLazyReelSafeExternalUrl } from "./getLazyReelSafeExternalUrl";
import type { LazyReelExample } from "@/lib/clipstitchr/types/lazyreel/LazyReelExample";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelExampleList({ examples }: { examples: LazyReelExample[] }) {
  if (examples.length === 0) {
    return null;
  }

  return (
    <section className={styles.exampleSection} aria-labelledby="lazyreel-examples">
      <h3 id="lazyreel-examples">Matching examples</h3>
      <ol>
        {examples.map((example, index) => {
          const safeUrl = getLazyReelSafeExternalUrl(example.url);

          return (
            <li key={`${example.url}-${index}`}>
              <div>
                <strong>{example.hookPattern}</strong>
                <span>{example.framework} · {example.videoFormat ?? "Format not recorded"}</span>
              </div>
              <p>{example.niche} · {example.views.toLocaleString()} views</p>
              {safeUrl ? (
                <a href={safeUrl} rel="noreferrer noopener" target="_blank">
                  Open public example
                </a>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
