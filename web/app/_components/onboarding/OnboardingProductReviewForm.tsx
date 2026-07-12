"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { OnboardingStepHeader } from "@/app/_components/onboarding/OnboardingStepHeader";
import { ProductHookMemoryFields } from "@/app/_components/hooks/ProductHookMemoryFields";
import { ProductHookStyleSelect } from "@/app/_components/settings/ProductHookStyleSelect";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { formatProductHookExamplesText } from "@/lib/clipstitchr/utils/formatProductHookExamplesText";
import { formatProductPainPointsText } from "@/lib/clipstitchr/utils/formatProductPainPointsText";
import { getProductProfileInputHasChanges } from "@/lib/clipstitchr/utils/getProductProfileInputHasChanges";
import { parseProductHookExamplesText } from "@/lib/clipstitchr/utils/parseProductHookExamplesText";
import { parseProductPainPointsText } from "@/lib/clipstitchr/utils/parseProductPainPointsText";

type OnboardingProductReviewFormProps = {
  product: ProductProfile;
  isSaving: boolean;
  onContinue: (
    input: ProductProfileCreateInput,
    shouldSave: boolean,
  ) => Promise<void>;
};

export function OnboardingProductReviewForm({
  product,
  isSaving,
  onContinue,
}: OnboardingProductReviewFormProps) {
  const [name, setName] = useState(product.name);
  const [websiteUrl, setWebsiteUrl] = useState(product.websiteUrl ?? "");
  const [productDetails, setProductDetails] = useState(product.productDetails);
  const [audienceDetails, setAudienceDetails] = useState(
    product.audienceDetails,
  );
  const [emotionalNarrative, setEmotionalNarrative] = useState(
    product.emotionalNarrative ?? "",
  );
  const [inferredProblem, setInferredProblem] = useState(
    product.inferredProblem ?? "",
  );
  const [painPointsText, setPainPointsText] = useState(
    formatProductPainPointsText(product.inferredPainPoints),
  );
  const [preferredCliprHookStyleKey, setPreferredCliprHookStyleKey] = useState(
    product.preferredCliprHookStyleKey ?? "",
  );
  const [rejectedHookExamplesText, setRejectedHookExamplesText] = useState(
    formatProductHookExamplesText(product.rejectedHookExamples),
  );
  const [hookGenerationGoal, setHookGenerationGoal] =
    useState<HookGenerationGoal>(product.hookGenerationGoal ?? "views");
  const [hookEdgeLevel, setHookEdgeLevel] = useState<HookEdgeLevel>(
    product.hookEdgeLevel ?? "punchy",
  );
  const input = useMemo<ProductProfileCreateInput>(
    () => ({
      name,
      websiteUrl: websiteUrl || undefined,
      productDetails,
      audienceDetails,
      emotionalNarrative: emotionalNarrative || undefined,
      inferredProblem,
      inferredPainPoints: parseProductPainPointsText(painPointsText),
      preferredCliprHookStyleKey: preferredCliprHookStyleKey || undefined,
      winningHookExamples: product.winningHookExamples,
      rejectedHookExamples: parseProductHookExamplesText(
        rejectedHookExamplesText,
      ),
      hookGenerationGoal,
      hookEdgeLevel,
    }),
    [
      audienceDetails,
      emotionalNarrative,
      hookEdgeLevel,
      hookGenerationGoal,
      inferredProblem,
      name,
      painPointsText,
      preferredCliprHookStyleKey,
      product.winningHookExamples,
      productDetails,
      rejectedHookExamplesText,
      websiteUrl,
    ],
  );
  const shouldSave = getProductProfileInputHasChanges({ input, product });
  const canContinue = name.trim().length > 0 && !isSaving;

  return (
    <Panel className="p-5">
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canContinue) {
            return;
          }

          void onContinue(input, shouldSave);
        }}
      >
        <OnboardingStepHeader
          eyebrow="Product profile"
          title="Review what ClipStitchr found"
          description="Tweak anything that feels off. This is the product context used for batch text, captions, and future drafts."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product name
            </span>
            <input
              value={name}
              maxLength={120}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              onChange={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Website
            </span>
            <input
              value={websiteUrl}
              maxLength={2048}
              inputMode="url"
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              onChange={(event) => setWebsiteUrl(event.currentTarget.value)}
            />
          </label>
        </div>
        <ProductHookStyleSelect
          value={preferredCliprHookStyleKey}
          onChange={setPreferredCliprHookStyleKey}
        />
        <ProductHookMemoryFields
          hookEdgeLevel={hookEdgeLevel}
          hookGenerationGoal={hookGenerationGoal}
          rejectedHookExamplesText={rejectedHookExamplesText}
          onHookEdgeLevelChange={setHookEdgeLevel}
          onHookGenerationGoalChange={setHookGenerationGoal}
          onRejectedHookExamplesTextChange={setRejectedHookExamplesText}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product details
            </span>
            <textarea
              value={productDetails}
              maxLength={2000}
              rows={5}
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="What it does, what makes it useful, and why people should care."
              onChange={(event) =>
                setProductDetails(event.currentTarget.value)
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Audience details
            </span>
            <textarea
              value={audienceDetails}
              maxLength={2000}
              rows={5}
              className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Who it is for and what they care about."
              onChange={(event) =>
                setAudienceDetails(event.currentTarget.value)
              }
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Audience problem
          </span>
          <textarea
            value={inferredProblem}
            maxLength={300}
            rows={3}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="The problem your audience wants solved."
            onChange={(event) => setInferredProblem(event.currentTarget.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Pain points
          </span>
          <textarea
            value={painPointsText}
            rows={5}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="One pain point per line."
            onChange={(event) => setPainPointsText(event.currentTarget.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Emotional narrative
          </span>
          <textarea
            value={emotionalNarrative}
            maxLength={3000}
            rows={5}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="What your audience is tired of, what they want, and how they want to feel."
            onChange={(event) =>
              setEmotionalNarrative(event.currentTarget.value)
            }
          />
        </label>
        <div className="flex justify-end">
          <Button
            type="submit"
            icon={<ArrowRight aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canContinue}
          >
            Continue to uploads
          </Button>
        </div>
      </form>
    </Panel>
  );
}
