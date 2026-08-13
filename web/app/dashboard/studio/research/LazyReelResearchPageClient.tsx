"use client";

import { Tabs } from "@base-ui/react/tabs";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { LazyReelCreativeBriefs } from "@/app/_components/studio/research/LazyReelCreativeBriefs";
import { LazyReelResearchHeader } from "@/app/_components/studio/research/LazyReelResearchHeader";
import { LazyReelResearchState } from "@/app/_components/studio/research/LazyReelResearchState";
import { LazyReelResearchWorkbench } from "@/app/_components/studio/research/LazyReelResearchWorkbench";
import { LazyReelRunHistory } from "@/app/_components/studio/research/LazyReelRunHistory";
import { LazyReelSavedReports } from "@/app/_components/studio/research/LazyReelSavedReports";
import { LazyReelWikiLibrary } from "@/app/_components/studio/research/LazyReelWikiLibrary";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { useLazyReelResearchCatalog } from "@/lib/clipstitchr/hooks/lazyreel/useLazyReelResearchCatalog";
import styles from "./lazyReelResearch.module.css";

export function LazyReelResearchPageClient() {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const catalogState = useLazyReelResearchCatalog(activeProductId);
  const productName = activeProduct?.name ?? "Studio Product";

  return (
    <DashboardShell>
      <div className={styles.researchPage}>
        <LazyReelResearchHeader
          catalog={catalogState.catalogResponse?.catalog ?? null}
          productName={productName}
        />
        {!activeProductId ? (
          <LazyReelResearchState
            title="Choose a Product first"
            message="Use the dashboard Product switcher to choose the Product this research should belong to."
          />
        ) : catalogState.isLoading ? (
          <LazyReelResearchState
            title="Opening the research notebook"
            message="Reading the current corpus snapshot and its source notes."
          />
        ) : catalogState.error || !catalogState.catalogResponse ? (
          <LazyReelResearchState
            actionLabel="Try loading again"
            title="The research notebook did not open"
            message={catalogState.error ?? "The catalog response was incomplete."}
            onAction={catalogState.reload}
          />
        ) : (
          <Tabs.Root
            className={styles.researchTabs}
            defaultValue="workbench"
            key={activeProductId}
          >
            <Tabs.List activateOnFocus aria-label="Research workspace views" className={styles.tabList}>
              <Tabs.Tab value="workbench">Workbench</Tabs.Tab>
              <Tabs.Tab value="history">Run history</Tabs.Tab>
              <Tabs.Tab value="reports">Saved reports</Tabs.Tab>
              <Tabs.Tab value="briefs">Creative briefs</Tabs.Tab>
              <Tabs.Tab value="library">Research library</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel className={styles.tabPanel} value="workbench">
              <LazyReelResearchWorkbench
                catalogResponse={catalogState.catalogResponse}
                productId={activeProductId}
                productName={productName}
              />
            </Tabs.Panel>
            <Tabs.Panel className={styles.tabPanel} value="history">
              <LazyReelRunHistory productId={activeProductId} />
            </Tabs.Panel>
            <Tabs.Panel className={styles.tabPanel} value="reports">
              <LazyReelSavedReports productId={activeProductId} />
            </Tabs.Panel>
            <Tabs.Panel className={styles.tabPanel} value="briefs">
              <LazyReelCreativeBriefs productId={activeProductId} />
            </Tabs.Panel>
            <Tabs.Panel className={styles.tabPanel} value="library">
              <LazyReelWikiLibrary documents={catalogState.catalogResponse.catalog.wikiDocuments} />
            </Tabs.Panel>
          </Tabs.Root>
        )}
      </div>
    </DashboardShell>
  );
}
