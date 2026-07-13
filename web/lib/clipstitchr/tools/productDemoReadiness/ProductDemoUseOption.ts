import type { ProductDemoUse } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUse";

export type ProductDemoUseOption = {
  value: ProductDemoUse;
  label: string;
  description: string;
  minimumDuration: number;
  maximumDuration: number;
};
