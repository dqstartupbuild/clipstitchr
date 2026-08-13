import { getLazyReelSafeExternalUrl } from "./getLazyReelSafeExternalUrl";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import type { LazyReelWorkflowResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowResult";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelReadOnlyResultDetailsProps = {
  result: LazyReelToolResult | LazyReelWorkflowResult;
};

export function LazyReelReadOnlyResultDetails({
  result,
}: LazyReelReadOnlyResultDetailsProps) {
  const safeLinks = result.links.flatMap((link) => {
    const url = getLazyReelSafeExternalUrl(link.url);

    return url ? [{ ...link, url }] : [];
  });

  return (
    <div className={styles.readOnlyResult}>
      <p>{result.summary}</p>
      {result.sections.map((section) => (
        <section key={section.id}>
          <h4>{section.title}</h4>
          <ul>
            {section.items.map((item, index) => (
              <li key={`${section.id}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      {result.evidence.length > 0 ? (
        <section>
          <h4>Evidence</h4>
          <ul>
            {result.evidence.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <strong>{item.label} ({item.kind})</strong>: {item.detail} Source: {item.source}.
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {safeLinks.length > 0 ? (
        <section>
          <h4>Public sources</h4>
          <ul>
            {safeLinks.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <a href={link.url} rel="noreferrer noopener" target="_blank">
                  {link.label}: {link.context}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h4>Method</h4>
        <p>{result.methodology}</p>
      </section>
      <section>
        <h4>Limitations</h4>
        {result.limitations.length > 0 ? (
          <ul>
            {result.limitations.map((limitation, index) => (
              <li key={`${limitation}-${index}`}>{limitation}</li>
            ))}
          </ul>
        ) : (
          <p>No additional limitations were recorded.</p>
        )}
      </section>
    </div>
  );
}
