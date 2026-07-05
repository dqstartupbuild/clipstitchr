"use client";

import { CirclePlay } from "lucide-react";
import { useMemo, useState } from "react";
import { CliprAvatarPanel } from "@/app/_components/clipr/CliprAvatarPanel";
import { CliprDemoClipPanel } from "@/app/_components/clipr/CliprDemoClipPanel";
import { CliprGenerationProgress } from "@/app/_components/clipr/CliprGenerationProgress";
import { CliprJobResult } from "@/app/_components/clipr/CliprJobResult";
import { CliprModeToggle } from "@/app/_components/clipr/CliprModeToggle";
import { CliprMusicControl } from "@/app/_components/clipr/CliprMusicControl";
import { CliprScriptIdeaPanel } from "@/app/_components/clipr/CliprScriptIdeaPanel";
import { CliprSceneControls } from "@/app/_components/clipr/CliprSceneControls";
import { CliprVoiceSelect } from "@/app/_components/clipr/CliprVoiceSelect";
import { BlockedActionMessage } from "@/app/_components/dashboard/BlockedActionMessage";
import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import { DashboardPageHeader } from "@/app/_components/dashboard/DashboardPageHeader";
import { DashboardShell } from "@/app/_components/dashboard/DashboardShell";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import { StickyPreviewColumn } from "@/app/_components/workflow/StickyPreviewColumn";
import { WorkflowLayout } from "@/app/_components/workflow/WorkflowLayout";
import { defaultCliprGenerationMode } from "@/lib/clipstitchr/constants/defaultCliprGenerationMode";
import { defaultCliprDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprDurationSeconds";
import { defaultCliprVisualDurationSeconds } from "@/lib/clipstitchr/constants/defaultCliprVisualDurationSeconds";
import { defaultCliprVoiceId } from "@/lib/clipstitchr/constants/defaultCliprVoiceId";
import { isCliprScriptModeEnabled } from "@/lib/clipstitchr/constants/isCliprScriptModeEnabled";
import { useClipLibrary } from "@/lib/clipstitchr/hooks/useClipLibrary";
import { useCliprGeneration } from "@/lib/clipstitchr/hooks/useCliprGeneration";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePhotoLibrary } from "@/lib/clipstitchr/hooks/usePhotoLibrary";
import type { CliprGenerationMode } from "@/lib/clipstitchr/types/CliprGenerationMode";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";

export function CliprPageClient() {
  const library = useClipLibrary();
  const products = useDashboardProduct();
  const photoLibrary = usePhotoLibrary();
  const generator = useCliprGeneration({ onCreated: library.refresh });
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [selectedDemoClipId, setSelectedDemoClipId] = useState("");
  const [mode, setMode] = useState<CliprGenerationMode>(
    defaultCliprGenerationMode,
  );
  const [scriptIdea, setScriptIdea] = useState("");
  const [avatarSceneLocation, setAvatarSceneLocation] = useState("");
  const [avatarSceneOutfit, setAvatarSceneOutfit] = useState("");
  const [avatarScenePose, setAvatarScenePose] = useState("");
  const [voiceOverride, setVoiceOverride] = useState<{
    avatarId: string;
    voiceId: string;
  } | null>(null);
  const [selectedMusicTrack, setSelectedMusicTrack] =
    useState<SharedMusicTrack | null>(null);
  const activeProductId = products.activeProductId ?? "";
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
  const demoClips = library.videoGroups?.demo?.clips ?? [];
  const activeDemoClipId =
    selectedDemoClipId || demoClips[0]?.id || "";
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
  const isDemoMode = mode === "demo";
  const allowsMusic = mode === "script";
  const canGenerate =
    Boolean(activeProductId) &&
    !generator.isGenerating &&
    (isDemoMode
      ? Boolean(activeDemoClipId)
      : Boolean(activeAvatarId) && selectedAvatarPhotoCount > 0);

  const error = products.error ?? photoLibrary.error ?? library.error;
  const blockedMessage = !activeProductId
    ? "Create or choose a product before generating clips."
    : isDemoMode && !activeDemoClipId
      ? "Add a product demo before remixing one."
      : !isDemoMode && !activeAvatarId
        ? "Add an avatar before generating UGC."
        : !isDemoMode && selectedAvatarPhotoCount === 0
          ? "Add avatar photos before generating UGC."
          : null;

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <DashboardPageHeader
          eyebrow="Clip generator"
          title="Create more UGC"
          description={
            isCliprScriptModeEnabled
              ? "Generate reactions, b-roll, or quick talking clips when you need more footage for Stitchr."
              : "Generate reactions or b-roll when you need more footage for Stitchr."
          }
        />

        {error ? (
          <DashboardAlert variant="error">{error}</DashboardAlert>
        ) : null}

        <WorkflowLayout
          aside={
            <StickyPreviewColumn className="flex flex-col gap-5">
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
            </StickyPreviewColumn>
          }
        >
          <Panel className="p-4">
            <PanelHeader
              eyebrow="Clipr"
              title={
                mode === "reaction"
                  ? "Generate a reaction"
                  : mode === "broll"
                    ? "Generate b-roll"
                    : mode === "script"
                      ? "Generate a talking clip"
                    : mode === "demo"
                      ? "Remix a demo"
                      : "Generate a Clip"
              }
              actions={<CliprModeToggle value={mode} onChange={setMode} />}
            />
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              {mode === "script" ? (
                <CliprScriptIdeaPanel
                  value={scriptIdea}
                  onChange={setScriptIdea}
                />
              ) : null}
              {isDemoMode ? (
                <CliprDemoClipPanel
                  clips={demoClips}
                  selectedClipId={activeDemoClipId}
                  onChange={setSelectedDemoClipId}
                />
              ) : (
                <>
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
                </>
              )}
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
                  selectedTrack={selectedMusicTrack}
                  onClearTrack={() => setSelectedMusicTrack(null)}
                  onSelectTrack={(track) => {
                    setSelectedMusicTrack(track);
                  }}
                />
              ) : null}
            </div>
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              {blockedMessage ? (
                <BlockedActionMessage message={blockedMessage} />
              ) : (
                <p className="text-sm leading-6 text-text-secondary">
                  {isDemoMode
                    ? "Clipr saves finished remixed demos into the Demo library."
                    : "Clipr saves finished reactions and b-roll into UGC."}
                </p>
              )}
              <Button
                type="button"
                icon={<CirclePlay aria-hidden className="h-4 w-4" />}
                isLoading={generator.isGenerating}
                disabled={!canGenerate}
                onClick={() =>
                  void generator.generate({
                    avatarId: activeAvatarId,
                    avatarSceneLocation,
                    avatarSceneOutfit,
                    avatarScenePose,
                    demoClipId: isDemoMode ? activeDemoClipId : undefined,
                    durationSeconds:
                      mode === "reaction" || mode === "broll" || mode === "demo"
                        ? defaultCliprVisualDurationSeconds
                        : defaultCliprDurationSeconds,
                    generationMode: mode,
                    musicTrackId: allowsMusic ? selectedMusicTrack?.id : undefined,
                    productId: activeProductId,
                    scriptIdea:
                      mode === "script" ? activeScriptIdea : undefined,
                    voiceId: activeVoiceId,
                  })
                }
              >
                {isDemoMode ? "Generate Demo" : "Generate UGC"}
              </Button>
            </div>
          </Panel>
        </WorkflowLayout>
      </div>
    </DashboardShell>
  );
}
