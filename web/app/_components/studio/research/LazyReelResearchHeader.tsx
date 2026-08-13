import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import type { LazyReelResearchCatalog } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchCatalog";
import styles from "@/app/dashboard/studio/research/lazyReelResearch.module.css";

type LazyReelResearchHeaderProps = {
  catalog: LazyReelResearchCatalog | null;
  productName: string;
};

export function LazyReelResearchHeader({
  catalog,
  productName,
}: LazyReelResearchHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <p className={styles.productName}>{productName}</p>
        <h1>Research notebook</h1>
      </div>
      <div className={styles.corpusLedger} aria-label="Current research corpus">
        <p>
          Use observed examples first. Inferences and limits stay attached to
          every result.
        </p>
        <dl>
          <div>
            <dt>Analyzed examples</dt>
            <dd>{catalog?.counts.analyzedVideos ?? "..."}</dd>
          </div>
          <div>
            <dt>Public links</dt>
            <dd>{catalog?.counts.exampleLinks ?? "..."}</dd>
          </div>
          <div>
            <dt>Wiki notes</dt>
            <dd>{catalog?.wikiDocuments.length ?? "..."}</dd>
          </div>
        </dl>
      </div>
      <StudioBetaWorkspaceNavigation current="research" />
    </header>
  );
}
