import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export type ProductEnrichmentInput = ProductProfileCreateInput & {
  websiteDetails?: string;
};
