"use client";

import { CirclePlay } from "lucide-react";
import { useMemo, useState } from "react";
import { CliprAvatarPanel } from "@/app/_components/clipr/CliprAvatarPanel";
import { CliprGenerationProgress } from "@/app/_components/clipr/CliprGenerationProgress";
import { CliprJobResult } from "@/app/_components/clipr/CliprJobResult";
import { CliprModeToggle } from "@/app/_components/clipr/CliprModeToggle";
import { CliprMusicControl } from "@/app/_components/clipr/CliprMusicControl";
import { CliprProductPanel } from "@/app/_components/clipr/CliprProductPanel";
import { CliprScriptIdeaPanel } from "@/app/_components/clipr/CliprScriptIdeaPanel";
import { CliprSceneControls } from "@/app/_components/clipr/CliprSceneControls";
import { CliprVideoModelSelect } from "@/app/_components/clipr/CliprVideoModelSelect";
import { CliprVoiceSelect } from "@/app/_components/clipr/CliprVoiceSelect";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { defaultCliprGenerationMode } from "@/lib/clipstitchr/constants/defaultCliprGenerationMode";
import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import { defaultCliprVisualDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprVisualDurationSeconds";
import { defaultCliprVoiceId } from "@/lib/clipstitchr/constants/defaultCliprVoiceId";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import { useProducts } from "@/lib/clipstitchr/hooks/useProducts";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { CliprVideoModelId } from "@/lib/clipstitchr/types/CliprVideoModelId";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";

export function CliprPageClient() {
  const library = useClipLibrary();
  const products = useProducts();
  const photoLibrary = usePhotoLibrary();
  const generator = useCliprGeneration({ onCreated: library.refresh });
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [mode, setMode] = useState<CliprGenerationMode>(
    defaultCliprGenerationMode,
  );
  const [videoModelId, setVideoModelId] = useState<CliprVideoModelId>("auto");
  const [scriptIdea, setScriptIdea] = useState("");
  const [avatarSceneLocation, setAvatarSceneLocation] = useState("");
  const [avatarSceneOutfit, setAvatarSceneOutfit] = useState("");
  const [avatarScenePose, setAvatarScenePose] = useState("");
  const [voiceOverride, setVoiceOverride] = useState<{
    avatarId: string;
    voiceId: string;
  } | null>(null);
  const [addMusic, setAddMusic] = useState(false);
  const [selectedMusicTrack, setSelectedMusicTrack] =
    useState<SharedMusicTrack | null>(null);
  const activeProductId =
    selectedProductId || products.defaultProductId || products.products[0]?.id || "";
  const defaultAvatar = useMemo(
    () =>
      photoLibrary.defaultAvatarId
        ? photoLibrary.avatars.find(
            (avatar) => avatar.id === photoLibrary.defaultAvatarId,
          )
        : undefined,
    [photoLibrary.avatars, photoLibrary.defaultAvatarId],
  );
  const activeAvatarId =
    selectedAvatarId || defaultAvatar?.id || photoLibrary.avatars[0]?.id || "";
  const activeAvatar = useMemo(
    () => photoLibrary.avatars.find((avatar) => avatar.id === activeAvatarId),
    [activeAvatarId, photoLibrary.avatars],
  );
  const avatarVoiceId = getCliprVoiceId(
    activeAvatar?.cliprVoiceId ??
      photoLibrary.defaultCliprVoiceId ??
      defaultCliprVoiceId,
  );
  const activeVoiceId =
    voiceOverride?.avatarId === activeAvatarId
      ? voiceOverride.voiceId
      : avatarVoiceId;
  const selectedAvatarPhotoCount = useMemo(
    () =>
      photoLibrary.photos.filter((photo) => photo.avatarId === activeAvatarId)
        .length,
    [activeAvatarId, photoLibrary.photos],
  );
  const activeScriptIdea = scriptIdea.trim();
  const isScriptLikeMode = mode === "any" || mode === "script";
  const allowsMusic = mode === "script";
  const canGenerate =
    Boolean(activeProductId) &&
    Boolean(activeAvatarId) &&
    selectedAvatarPhotoCount > 0 &&
    !generator.isGenerating;

  const error = products.error ?? photoLibrary.error ?? library.error;

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
            <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-accent-dark">Clipr</p>
                <h2 className="mt-0.5 text-base font-bold text-text-primary">
                  {mode === "reaction"
                    ? "Generate a reaction"
                    : mode === "broll"
                      ? "Generate b-roll"
                      : "Generate a Clip"}
                </h2>
              </div>
              <CliprModeToggle value={mode} onChange={setMode} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {mode === "script" ? (
                <CliprScriptIdeaPanel
                  value={scriptIdea}
                  onChange={setScriptIdea}
                />
              ) : null}
              <CliprProductPanel
                products={products.products}
                selectedProductId={activeProductId}
                onChange={setSelectedProductId}
              />
              <CliprAvatarPanel
                avatars={photoLibrary.avatars}
                photos={photoLibrary.photos}
                selectedAvatarId={activeAvatarId}
                onChange={(avatarId) => {
                  setSelectedAvatarId(avatarId);
                  setVoiceOverride(null);
                }}
              />
              <CliprSceneControls
                location={avatarSceneLocation}
                outfit={avatarSceneOutfit}
                pose={avatarScenePose}
                onLocationChange={setAvatarSceneLocation}
                onOutfitChange={setAvatarSceneOutfit}
                onPoseChange={setAvatarScenePose}
              />
              <CliprVideoModelSelect
                mode={mode}
                value={videoModelId}
                onChange={setVideoModelId}
              />
              {isScriptLikeMode ? (
                <CliprVoiceSelect
                  value={activeVoiceId}
                  onVoiceChange={(voiceId) =>
                    setVoiceOverride({ avatarId: activeAvatarId, voiceId })
                  }
                />
              ) : null}
              {allowsMusic ? (
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
              ) : null}
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
                    addMusic:
                      allowsMusic && addMusic && !selectedMusicTrack,
                    avatarId: activeAvatarId,
                    avatarSceneLocation,
                    avatarSceneOutfit,
                    avatarScenePose,
                    durationSeconds:
                      mode === "reaction" || mode === "broll"
                        ? defaultCliprVisualDurationSeconds
                        : defaultCliprDurationSeconds,
                    generationMode: mode,
                    musicTrackId: allowsMusic ? selectedMusicTrack?.id : undefined,
                    productId: activeProductId,
                    scriptIdea:
                      mode === "script" ? activeScriptIdea : undefined,
                    videoModelId,
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
