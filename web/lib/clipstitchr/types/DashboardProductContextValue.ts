import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export type DashboardProductContextValue = {
  activeProduct?: ProductProfile;
  activeProductId?: string;
  defaultProductId?: string;
  error: string | null;
  isBackfillingLegacyContent: boolean;
  isCreating: boolean;
  isLoading: boolean;
  isSaving: boolean;
  products: ProductProfile[];
  requiresProductSetup: boolean;
  createProduct: (input: ProductProfileCreateInput) => Promise<ProductProfile>;
  setActiveProduct: (product: ProductProfile) => Promise<void>;
  updateProduct: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};
