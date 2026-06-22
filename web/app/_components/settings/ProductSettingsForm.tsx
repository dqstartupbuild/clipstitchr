"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ProductHookMemoryFields } from "@/app/_components/settings/ProductHookMemoryFields";
import { ProductHookStyleSelect } from "@/app/_components/settings/ProductHookStyleSelect";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { HookEdgeLevel } from "@/lib/clipstitchr/types/HookEdgeLevel";
import type { HookGenerationGoal } from "@/lib/clipstitchr/types/HookGenerationGoal";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { parseProductHookExamplesText } from "@/lib/clipstitchr/utils/parseProductHookExamplesText";

type ProductSettingsFormProps = {
  isSaving: boolean;
  onCreate: (input: ProductProfileCreateInput) => Promise<unknown>;
};

export function ProductSettingsForm({
  isSaving,
  onCreate,
}: ProductSettingsFormProps) {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [audienceDetails, setAudienceDetails] = useState("");
  const [emotionalNarrative, setEmotionalNarrative] = useState("");
  const [preferredCliprHookStyleKey, setPreferredCliprHookStyleKey] =
    useState("");
  const [winningHookExamplesText, setWinningHookExamplesText] = useState("");
  const [rejectedHookExamplesText, setRejectedHookExamplesText] = useState("");
  const [hookGenerationGoal, setHookGenerationGoal] =
    useState<HookGenerationGoal>("views");
  const [hookEdgeLevel, setHookEdgeLevel] = useState<HookEdgeLevel>("punchy");
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isSaving;

  return (
    <Panel className="p-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!canSave) {
            return;
          }

          try {
            await onCreate({
              name,
              websiteUrl: websiteUrl || undefined,
              productDetails,
              audienceDetails,
              emotionalNarrative: emotionalNarrative || undefined,
              preferredCliprHookStyleKey:
                preferredCliprHookStyleKey || undefined,
              winningHookExamples: parseProductHookExamplesText(
                winningHookExamplesText,
              ),
              rejectedHookExamples: parseProductHookExamplesText(
                rejectedHookExamplesText,
              ),
              hookGenerationGoal,
              hookEdgeLevel,
            });
          } catch {
            return;
          }

          setName("");
          setWebsiteUrl("");
          setProductDetails("");
          setAudienceDetails("");
          setEmotionalNarrative("");
          setPreferredCliprHookStyleKey("");
          setWinningHookExamplesText("");
          setRejectedHookExamplesText("");
          setHookGenerationGoal("views");
          setHookEdgeLevel("punchy");
        }}
      >
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Products
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Add product context
          </h2>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Product name
          </span>
          <input
            value={name}
            maxLength={120}
            className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="Product or offer"
            onChange={(event) => setName(event.currentTarget.value)}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Website URL
          </span>
          <input
            value={websiteUrl}
            maxLength={2048}
            inputMode="url"
            className="mt-1.5 h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="https://example.com"
            onChange={(event) => setWebsiteUrl(event.currentTarget.value)}
          />
        </label>
        <ProductHookStyleSelect
          value={preferredCliprHookStyleKey}
          onChange={setPreferredCliprHookStyleKey}
        />
        <ProductHookMemoryFields
          hookEdgeLevel={hookEdgeLevel}
          hookGenerationGoal={hookGenerationGoal}
          rejectedHookExamplesText={rejectedHookExamplesText}
          winningHookExamplesText={winningHookExamplesText}
          onHookEdgeLevelChange={setHookEdgeLevel}
          onHookGenerationGoalChange={setHookGenerationGoal}
          onRejectedHookExamplesTextChange={setRejectedHookExamplesText}
          onWinningHookExamplesTextChange={setWinningHookExamplesText}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product details
            </span>
            <textarea
              value={productDetails}
              maxLength={2000}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-5 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Benefits, proof points, offer, constraints."
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
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-5 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Audience, pains, buying triggers, language."
              onChange={(event) =>
                setAudienceDetails(event.currentTarget.value)
              }
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Emotional narrative
          </span>
          <textarea
            value={emotionalNarrative}
            maxLength={3000}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-5 text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder="Who they are emotionally, what they are tired of, what identity shift they want, and what kind of story Stitchr hooks should imply."
            onChange={(event) =>
              setEmotionalNarrative(event.currentTarget.value)
            }
          />
        </label>
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            icon={<Plus aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canSave}
          >
            Save product
          </Button>
        </div>
      </form>
    </Panel>
  );
}
