"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { OnboardingStepHeader } from "@/app/_components/onboarding/OnboardingStepHeader";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type OnboardingProductStartFormProps = {
  isSaving: boolean;
  onCreate: (input: ProductProfileCreateInput) => Promise<void>;
};

export function OnboardingProductStartForm({
  isSaving,
  onCreate,
}: OnboardingProductStartFormProps) {
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const canSubmit =
    name.trim().length > 0 && websiteUrl.trim().length > 0 && !isSaving;

  return (
    <Panel className="p-5">
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();

          if (!canSubmit) {
            return;
          }

          void onCreate({
            name,
            websiteUrl,
            productDetails: "",
            audienceDetails: "",
          });
        }}
      >
        <OnboardingStepHeader
          eyebrow="Product"
          title="Start with the product"
          description="Add the product name and website. ClipStitchr will pull together a starter profile for you to review next."
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
              placeholder="Guppy Calisthenics"
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
              placeholder="https://example.com"
              onChange={(event) => setWebsiteUrl(event.currentTarget.value)}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            icon={<ArrowRight aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!canSubmit}
          >
            Build profile
          </Button>
        </div>
      </form>
    </Panel>
  );
}
