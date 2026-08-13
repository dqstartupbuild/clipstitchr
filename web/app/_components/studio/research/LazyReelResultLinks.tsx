import { getLazyReelSafeExternalUrl } from "./getLazyReelSafeExternalUrl";
import type { LazyReelResultLink } from "@/lib/clipstitchr/types/lazyreel/LazyReelResultLink";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

export function LazyReelResultLinks({ links }: { links: LazyReelResultLink[] }) {
  const safeLinks = links.flatMap((link) => {
    const url = getLazyReelSafeExternalUrl(link.url);

    return url ? [{ ...link, url }] : [];
  });

  if (safeLinks.length === 0) {
    return null;
  }

  return (
    <section className={styles.sourceLinks} aria-labelledby="lazyreel-sources">
      <h3 id="lazyreel-sources">Original public examples</h3>
      <ul>
        {safeLinks.map((link, index) => (
          <li key={`${link.url}-${index}`}>
            <a href={link.url} rel="noreferrer noopener" target="_blank">
              <strong>{link.label}</strong>
              <span>{link.context}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
