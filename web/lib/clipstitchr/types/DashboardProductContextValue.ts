import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export type DashboardProductContextValue = {
  activeProduct?: ProductProfile;
  activeProductId?: string;
  defaultProductId?: string;
  defaultingProductId: string | null;
  deletingProductId: string | null;
  error: string | null;
  isBackfillingLegacyContent: boolean;
  isCreating: boolean;
  isLoading: boolean;
  isSaving: boolean;
  products: ProductProfile[];
  requiresOnboarding: boolean;
  requiresProductSetup: boolean;
  savingProductId: string | null;
  createProduct: (input: ProductProfileCreateInput) => Promise<ProductProfile>;
  deleteProduct: (id: string) => Promise<void>;
  markOnboardingCompletedLocally: (completedAt: string) => void;
  setActiveProduct: (product: ProductProfile) => Promise<void>;
  updateProduct: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};
