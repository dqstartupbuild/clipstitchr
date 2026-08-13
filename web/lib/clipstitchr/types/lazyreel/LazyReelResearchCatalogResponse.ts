import type { LazyReelResearchCatalog } from "./LazyReelResearchCatalog";
import type { LazyReelWorkflowDefinition } from "./LazyReelWorkflowDefinition";

export type LazyReelResearchCatalogResponse = {
  catalog: LazyReelResearchCatalog;
  workflows: LazyReelWorkflowDefinition[];
};
