"use client";

import { useMemo, useState } from "react";
import { CliprControlsPanel } from "@/app/_components/clipr/CliprControlsPanel";
import { CliprOutputPanel } from "@/app/_components/clipr/CliprOutputPanel";
import { CliprProductPanel } from "@/app/_components/clipr/CliprProductPanel";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { SwaprPhotoSelector } from "@/app/_components/swapr/SwaprPhotoSelector";
import { Panel } from "@/app/_components/ui/Panel";
import {
  CLIPR_DEFAULT_DURATION_SECONDS,
} from "@/lib/clipstitchr/constants/cliprDurationOptions";
import { CLIPR_DEFAULT_VOICE_ID } from "@/lib/clipstitchr/constants/cliprVoiceOptions";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { getSearchParamValue } from "@/lib/clipstitchr/utils/getSearchParamValue";

const CLIPR_DEFAULT_VOICE_STORAGE_KEY = "clipstitchr.clipr.defaultVoice";

export function CliprPageClient() {
  const products = useProducts();
  const library = useClipLibrary();
  const photoLibrary = usePhotoLibrary();
  const generator = useCliprGeneration(library.refresh);
  const productOptions = useMemo(
    () =>
      products.products.map((product) => ({
        value: product.id,
        label: product.name,
      })),
    [products.products],
  );
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | undefined>(
    () => getSearchParamValue("photoId") ?? undefined,
  );
  const [durationSeconds, setDurationSeconds] =
    useState<CliprDurationSeconds>(CLIPR_DEFAULT_DURATION_SECONDS);
  const [voice, setVoice] = useState(() => {
    if (typeof window === "undefined") {
      return CLIPR_DEFAULT_VOICE_ID;
    }

    return getCliprVoiceId(
      window.localStorage.getItem(CLIPR_DEFAULT_VOICE_STORAGE_KEY) ?? "",
    );
  });
  const [hasConsent, setHasConsent] = useState(false);
  const [assetLoadError, setAssetLoadError] = useState<string | null>(null);
  const activeProductId = selectedProductId ?? products.products[0]?.id ?? "";
  const selectedProduct = products.products.find(
    (product) => product.id === activeProductId,
  );
  const selectedPhoto = photoLibrary.photos.find(
    (photo) => photo.id === selectedPhotoId,
  );
  const isReady = Boolean(selectedProduct && selectedPhoto && hasConsent);

  const handleMakeVoiceDefault = (nextVoice: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CLIPR_DEFAULT_VOICE_STORAGE_KEY,
        getCliprVoiceId(nextVoice),
      );
    }
  };

  const handleSelectPhoto = (photo: PhotoAssetMetadata) => {
    setSelectedPhotoId((currentPhotoId) =>
      currentPhotoId === photo.id ? undefined : photo.id,
    );
  };

  const handleGenerate = async () => {
    if (!selectedProduct || !selectedPhoto) {
      return;
    }

    setAssetLoadError(null);

    const photo = await photoLibrary.loadPhoto(selectedPhoto.id);

    if (!photo) {
      setAssetLoadError("Unable to load the selected avatar photo.");
      return;
    }

    await generator.generate({
      durationSeconds,
      photo,
      product: selectedProduct,
      voice,
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardPageHeader
          eyebrow="Engagement clips"
          title="Create Clipr clips"
          description="Generate no-CTA talking clips from a saved product and avatar photo."
        />

        {products.error || photoLibrary.error || library.error || assetLoadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {products.error ??
              photoLibrary.error ??
              library.error ??
              assetLoadError}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <Panel className="order-2 min-w-0 p-4 xl:order-1">
            <div className="grid gap-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <CliprProductPanel
                  productOptions={productOptions}
                  selectedProductId={activeProductId}
                  onProductChange={setSelectedProductId}
                />
                <SwaprPhotoSelector
                  avatars={photoLibrary.avatars}
                  photos={photoLibrary.photos}
                  selectedPhotoId={selectedPhotoId}
                  onSelect={handleSelectPhoto}
                />
              </div>
              <CliprControlsPanel
                durationSeconds={durationSeconds}
                hasConsent={hasConsent}
                isGenerating={generator.isGenerating}
                isReady={isReady}
                voice={voice}
                onConsentChange={setHasConsent}
                onDurationChange={setDurationSeconds}
                onGenerate={() => void handleGenerate()}
                onMakeVoiceDefault={handleMakeVoiceDefault}
                onVoiceChange={setVoice}
              />
            </div>
          </Panel>
          <div className="order-1 min-w-0 w-full max-w-[340px] justify-self-center xl:sticky xl:top-5 xl:order-2 xl:justify-self-end">
            <CliprOutputPanel
              status={generator.status}
              progress={generator.progress}
              error={generator.error}
              generatedClip={generator.generatedClip}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
