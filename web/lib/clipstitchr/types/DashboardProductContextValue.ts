import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import type { ProductLimitDialogReason } from "@/lib/clipstitchr/types/ProductLimitDialogReason";

export type DashboardProductContextValue = {
  activeProduct?: ProductProfile;
  activeProductId?: string;
  archivedProducts: ProductProfile[];
  defaultProductId?: string;
  defaultingProductId: string | null;
  deletingProductId: string | null;
  error: string | null;
  isBackfillingLegacyContent: boolean;
  isCreating: boolean;
  isLoading: boolean;
  isProductLimitReached: boolean;
  isSaving: boolean;
  lockedProductIds: string[];
  planName: string | null;
  productLimit: number | null;
  products: ProductProfile[];
  restoringProductId: string | null;
  requiresOnboarding: boolean;
  requiresProductSetup: boolean;
  savingProductId: string | null;
  createProduct: (input: ProductProfileCreateInput) => Promise<ProductProfile>;
  deleteProduct: (id: string) => Promise<void>;
  markOnboardingCompletedLocally: (completedAt: string) => void;
  restoreProduct: (id: string) => Promise<void>;
  setActiveProduct: (product: ProductProfile) => Promise<void>;
  showProductPlanLimitDialog: (reason: ProductLimitDialogReason) => void;
  updateProduct: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};
