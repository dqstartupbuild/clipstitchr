"use client";

import { ArrowRight } from "lucide-react";
import { UploadPanel } from "@/app/_components/dashboard/UploadPanel";
import { OnboardingClipReviewList } from "@/app/_components/onboarding/OnboardingClipReviewList";
import { OnboardingStepHeader } from "@/app/_components/onboarding/OnboardingStepHeader";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { UploadAssetType } from "@/lib/clipstitchr/types/UploadAssetType";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type OnboardingUploadStepProps = {
  assetType: Extract<UploadAssetType, "ugc" | "demo">;
  clips: VideoClipMetadata[];
  continueLabel: string;
  description: string;
  emptyDescription: string;
  emptyTitle: string;
  productId?: string;
  reviewTitle: string;
  title: string;
  onContinue: () => void;
  onRefresh: () => void | Promise<void>;
  onUploaded: () => void | Promise<void>;
};

export function OnboardingUploadStep({
  assetType,
  clips,
  continueLabel,
  description,
  emptyDescription,
  emptyTitle,
  productId,
  reviewTitle,
  title,
  onContinue,
  onRefresh,
  onUploaded,
}: OnboardingUploadStepProps) {
  const canContinue = clips.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <Panel className="p-5">
        <OnboardingStepHeader
          eyebrow={assetType === "ugc" ? "UGC clips" : "Product demo"}
          title={title}
          description={description}
        />
      </Panel>
      <UploadPanel
        allowedAssetTypes={[assetType]}
        canUploadDemo={assetType !== "demo" || Boolean(productId)}
        demoProductId={productId}
        initialAssetType={assetType}
        isPhotoUploading={false}
        onPhotoUploaded={async () => false}
        onUploaded={onUploaded}
      />
      <OnboardingClipReviewList
        clips={clips}
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        title={reviewTitle}
        onRefresh={onRefresh}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          icon={<ArrowRight aria-hidden className="h-4 w-4" />}
          disabled={!canContinue}
          onClick={onContinue}
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}
