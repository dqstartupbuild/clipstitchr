import type { LazyReelResearchCatalogResponse } from "./LazyReelResearchCatalogResponse";

export type LazyReelResearchCatalogState = {
  catalogResponse: LazyReelResearchCatalogResponse | null;
  error: string | null;
  isLoading: boolean;
  reload: () => void;
};
