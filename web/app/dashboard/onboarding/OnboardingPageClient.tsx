"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { OnboardingBatchStep } from "@/app/_components/onboarding/OnboardingBatchStep";
import { OnboardingErrorAlert } from "@/app/_components/onboarding/OnboardingErrorAlert";
import { OnboardingProductReviewForm } from "@/app/_components/onboarding/OnboardingProductReviewForm";
import { OnboardingProductStartForm } from "@/app/_components/onboarding/OnboardingProductStartForm";
import { OnboardingShell } from "@/app/_components/onboarding/OnboardingShell";
import { OnboardingUploadStep } from "@/app/_components/onboarding/OnboardingUploadStep";
import {
  generateStitchrBatch,
  type GenerateStitchrBatchOptions,
} from "@/lib/clipstitchr/client/generateStitchrBatch";
import { api } from "@/convex/_generated/api";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import type { OnboardingStep } from "@/lib/clipstitchr/types/OnboardingStep";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

export function OnboardingPageClient() {
  const router = useRouter();
  const completeOnboarding = useMutation(
    api.productPreferences.completeOnboarding,
  );
  const products = useDashboardProduct();
  const library = useClipLibrary();
  const [localProduct, setLocalProduct] = useState<ProductProfile | null>(
    () => products.activeProduct ?? null,
  );
  const [step, setStep] = useState<OnboardingStep>(() =>
    products.activeProduct ? "product-review" : "product-start",
  );
  const [error, setError] = useState<string | null>(null);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const product =
    localProduct && products.activeProduct?.id === localProduct.id
      ? products.activeProduct
      : (localProduct ?? products.activeProduct ?? null);
  const activeStep = step === "product-start" && product ? "product-review" : step;
  const ugcClips = library.videoGroups.ugc.clips;
  const demoClips = library.videoGroups.demo.clips;

  const handleCreateProduct = useCallback(
    async (input: ProductProfileCreateInput) => {
      setError(null);

      try {
        const createdProduct = await products.createProduct(input);

        setLocalProduct(createdProduct);
        setStep("product-review");
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to build this product profile.",
        );
      }
    },
    [products],
  );

  const handleProductReviewContinue = useCallback(
    async (input: ProductProfileCreateInput, shouldSave: boolean) => {
      if (!product) {
        return;
      }

      setError(null);

      try {
        if (shouldSave) {
          const updatedProduct = (await products.updateProduct(
            product.id,
            input,
          )) as ProductProfile;

          setLocalProduct(updatedProduct);
        }

        setStep("ugc-upload");
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to save this product profile.",
        );
      }
    },
    [product, products],
  );

  const handleGenerateBatch = useCallback(
    async (options: GenerateStitchrBatchOptions) => {
      setError(null);
      setBatchMessage(null);
      setIsGeneratingBatch(true);

      try {
        const result = await generateStitchrBatch(options);

        if (result.count > 0) {
          const completedAt = new Date().toISOString();

          await completeOnboarding({
            completedAt,
          });
          products.markOnboardingCompletedLocally(completedAt);
          router.push("/dashboard/library?tab=stitches");
          return;
        }

        setBatchMessage(result.message ?? "No Stitch drafts were queued.");
      } catch (nextError) {
        setBatchMessage(
          nextError instanceof Error
            ? nextError.message
            : "Unable to create this batch.",
        );
      } finally {
        setIsGeneratingBatch(false);
      }
    },
    [completeOnboarding, products, router],
  );

  return (
    <OnboardingShell activeStep={activeStep}>
      <OnboardingErrorAlert message={error ?? products.error ?? library.error} />
      {activeStep === "product-start" ? (
        <OnboardingProductStartForm
          isSaving={products.isCreating}
          onCreate={handleCreateProduct}
        />
      ) : null}
      {activeStep === "product-review" && product ? (
        <OnboardingProductReviewForm
          product={product}
          isSaving={products.isSaving}
          onContinue={handleProductReviewContinue}
        />
      ) : null}
      {activeStep === "ugc-upload" ? (
        <OnboardingUploadStep
          assetType="ugc"
          clips={ugcClips}
          continueLabel="Continue to demos"
          description="Upload the creator clips you already have. Each saved clip becomes a possible first half of an ad."
          emptyDescription="Upload UGC clips and keep this page open while ClipStitchr normalizes and scores them."
          emptyTitle="No UGC clips ready yet"
          reviewTitle="Review UGC scores"
          title="Upload UGC clips"
          onContinue={() => setStep("demo-upload")}
          onRefresh={library.refresh}
          onUploaded={library.refresh}
        />
      ) : null}
      {activeStep === "demo-upload" ? (
        <OnboardingUploadStep
          assetType="demo"
          clips={demoClips}
          continueLabel="Continue to batch"
          description="Upload the product walkthrough or screen recording that should come after the UGC."
          emptyDescription="Upload a demo and keep this page open while ClipStitchr normalizes and scores it."
          emptyTitle="No demo ready yet"
          productId={product?.id}
          reviewTitle="Review demo scores"
          title="Upload the product demo"
          onContinue={() => setStep("batch")}
          onRefresh={library.refresh}
          onUploaded={library.refresh}
        />
      ) : null}
      {activeStep === "batch" ? (
        <OnboardingBatchStep
          demoCount={demoClips.length}
          isGenerating={isGeneratingBatch}
          message={batchMessage}
          ugcCount={ugcClips.length}
          onGenerate={handleGenerateBatch}
        />
      ) : null}
    </OnboardingShell>
  );
}
