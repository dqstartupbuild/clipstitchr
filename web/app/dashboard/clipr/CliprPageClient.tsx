"use client";

import { CirclePlay } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CliprAvatarPanel } from "@/app/_components/clipr/CliprAvatarPanel";
import { CliprDurationControl } from "@/app/_components/clipr/CliprDurationControl";
import { CliprGenerationProgress } from "@/app/_components/clipr/CliprGenerationProgress";
import { CliprJobResult } from "@/app/_components/clipr/CliprJobResult";
import { CliprMusicControl } from "@/app/_components/clipr/CliprMusicControl";
import { CliprProductPanel } from "@/app/_components/clipr/CliprProductPanel";
import { CliprVoiceSelect } from "@/app/_components/clipr/CliprVoiceSelect";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import { defaultCliprVoiceId } from "@/lib/clipstitchr/constants/defaultCliprVoiceId";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

export function CliprPageClient() {
  const { isAuthenticated } = useConvexAuth();
  const library = useClipLibrary();
  const products = useProducts();
  const photoLibrary = usePhotoLibrary();
  const preference = useQuery(
    api.cliprPreferences.get,
    isAuthenticated ? {} : "skip",
  );
  const saveDefaultVoice = useMutation(api.cliprPreferences.setDefaultVoice);
  const generator = useCliprGeneration({ onCreated: library.refresh });
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [durationSeconds, setDurationSeconds] = useState<CliprDurationSeconds>(
    defaultCliprDurationSeconds,
  );
  const [voiceId, setVoiceId] = useState("");
  const [addMusic, setAddMusic] = useState(false);
  const [selectedMusicTrack, setSelectedMusicTrack] =
    useState<SharedMusicTrack | null>(null);
  const [optimisticDefaultVoiceId, setOptimisticDefaultVoiceId] = useState("");
  const [isSavingDefaultVoice, setIsSavingDefaultVoice] = useState(false);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const activeProductId = selectedProductId || products.products[0]?.id || "";
  const activeAvatarId =
    selectedAvatarId || photoLibrary.avatars[0]?.id || "";
  const defaultVoiceId =
    optimisticDefaultVoiceId || preference?.defaultVoiceId || defaultCliprVoiceId;
  const activeVoiceId = voiceId || defaultVoiceId;
  const canSaveDefaultVoice = activeVoiceId !== defaultVoiceId;
  const selectedAvatarPhotoCount = useMemo(
    () =>
      photoLibrary.photos.filter((photo) => photo.avatarId === activeAvatarId)
        .length,
    [activeAvatarId, photoLibrary.photos],
  );
  const canGenerate =
    Boolean(activeProductId) &&
    Boolean(activeAvatarId) &&
    selectedAvatarPhotoCount > 0 &&
    !generator.isGenerating;
  const saveSelectedVoiceAsDefault = useCallback(async () => {
    setIsSavingDefaultVoice(true);
    setPreferenceError(null);

    try {
      await saveDefaultVoice({
        defaultVoiceId: activeVoiceId,
        updatedAt: new Date().toISOString(),
      });
      setOptimisticDefaultVoiceId(activeVoiceId);
    } catch (nextError) {
      setPreferenceError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save the default Clipr voice.",
      );
    } finally {
      setIsSavingDefaultVoice(false);
    }
  }, [activeVoiceId, saveDefaultVoice]);
  const error =
    products.error ?? photoLibrary.error ?? library.error ?? preferenceError;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow="Clip generator"
          title="Create engagement Clips"
          description="Generate reusable UGC-style Clips for the library, then use them in Stitchr."
        />

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <Panel className="p-4">
            <div className="grid gap-5 lg:grid-cols-2">
              <CliprProductPanel
                products={products.products}
                selectedProductId={activeProductId}
                onChange={setSelectedProductId}
              />
              <CliprAvatarPanel
                avatars={photoLibrary.avatars}
                photos={photoLibrary.photos}
                selectedAvatarId={activeAvatarId}
                onChange={setSelectedAvatarId}
              />
              <CliprDurationControl
                value={durationSeconds}
                onChange={setDurationSeconds}
              />
              <CliprVoiceSelect
                canSaveDefault={canSaveDefaultVoice}
                isSavingDefault={isSavingDefaultVoice}
                value={activeVoiceId}
                onSaveDefault={() => void saveSelectedVoiceAsDefault()}
                onVoiceChange={setVoiceId}
              />
              <CliprMusicControl
                checked={addMusic}
                selectedTrack={selectedMusicTrack}
                onChange={(checked) => {
                  setAddMusic(checked);

                  if (checked) {
                    setSelectedMusicTrack(null);
                  }
                }}
                onClearTrack={() => setSelectedMusicTrack(null)}
                onSelectTrack={(track) => {
                  setSelectedMusicTrack(track);
                  setAddMusic(false);
                }}
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-text-secondary">
                Clipr saves finished clips into the Content Library as Clips.
              </p>
              <Button
                type="button"
                icon={<CirclePlay aria-hidden className="h-4 w-4" />}
                isLoading={generator.isGenerating}
                disabled={!canGenerate}
                onClick={() =>
                  void generator.generate({
                    addMusic: addMusic && !selectedMusicTrack,
                    avatarId: activeAvatarId,
                    durationSeconds,
                    musicTrackId: selectedMusicTrack?.id,
                    productId: activeProductId,
                    voiceId: activeVoiceId,
                  })
                }
              >
                Generate Clip
              </Button>
            </div>
          </Panel>

          <div className="flex flex-col gap-5 xl:sticky xl:top-5">
            <CliprGenerationProgress
              error={generator.error}
              message={generator.message}
              progress={generator.progress}
              status={generator.status}
            />
            <CliprJobResult
              finalClipId={generator.finalClipId}
              job={generator.job}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
