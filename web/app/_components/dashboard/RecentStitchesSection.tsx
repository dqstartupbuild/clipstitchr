"use client";

import { DashboardEmptyState } from "@/app/_components/dashboard/DashboardEmptyState";
import { StitchCard } from "@/app/_components/dashboard/StitchCard";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import type { QuickEditCrop } from "@/lib/clipstitchr/types/QuickEditCrop";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchMusicMetadata } from "@/lib/clipstitchr/types/StitchMusicMetadata";
import type { StitchScore } from "@/lib/clipstitchr/types/StitchScore";
import type { StitchSourceSettingsUpdate } from "@/lib/clipstitchr/types/StitchSourceSettingsUpdate";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";

type RecentStitchesSectionProps = {
  demoClips: VideoClipMetadata[];
  savingTemplateStitchId?: string | null;
  stitches: Stitch[];
  onDelete: (id: string) => void | Promise<void>;
  onLoadClip: (id: string) => Promise<VideoClip | null>;
  onLoadPoster?: (id: string) => Promise<Blob | null>;
  onLoadVideo?: (stitch: Stitch) => Promise<Blob | null>;
  onPostBridgeScheduled?: () => void | Promise<void>;
  onSaveTemplate?: (stitch: Stitch) => void | Promise<unknown>;
  onScore?: (stitch: Stitch) => Promise<StitchScore>;
  onApplyQuickEdit?: (stitch: Stitch) => Promise<void>;
  onResetQuickEdit?: (stitch: Stitch) => Promise<void>;
  onUpdateMusic: (
    stitch: Stitch,
    music: StitchMusicMetadata | null,
  ) => void | Promise<void>;
  onUpdateSocialCaption: (
    stitch: Stitch,
    socialCaption: string | null,
  ) => void | Promise<void>;
  onUpdatePostedStatus: (
    stitch: Stitch,
    isPosted: boolean,
  ) => void | Promise<void>;
  onUpdateSourceSettings: (
    stitch: Stitch,
    update: StitchSourceSettingsUpdate,
  ) => void | Promise<void>;
  onUpdateSourceCrop?: (
    stitch: Stitch,
    source: "ugc" | "demo",
    crop: QuickEditCrop | null,
  ) => void | Promise<void>;
  onUpdateSourceCuts?: (
    stitch: Stitch,
    source: "ugc" | "demo",
    removeRanges: QuickEditRemoveRange[],
  ) => void | Promise<void>;
  onUpdateTextOverlay: (
    stitch: Stitch,
    textOverlay: TextOverlay | TextOverlay[] | null,
  ) => void | Promise<void>;
  ugcClips: VideoClipMetadata[];
};

export function RecentStitchesSection({
  demoClips,
  savingTemplateStitchId = null,
  stitches,
  onDelete,
  onLoadClip,
  onLoadPoster,
  onLoadVideo,
  onPostBridgeScheduled,
  onSaveTemplate,
  onScore,
  onApplyQuickEdit,
  onResetQuickEdit,
  onUpdateMusic,
  onUpdatePostedStatus,
  onUpdateSocialCaption,
  onUpdateSourceCrop,
  onUpdateSourceCuts,
  onUpdateSourceSettings,
  onUpdateTextOverlay,
  ugcClips,
}: RecentStitchesSectionProps) {
  return (
    <section id="recent-stitches">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-text-primary">
          Recent Stitches
        </h2>
        <SecondaryButtonLink
          href="/dashboard/library?tab=stitches"
          className="h-9 px-3 text-xs"
        >
          See all
        </SecondaryButtonLink>
      </div>
      {stitches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stitches.map((stitch) => (
            <StitchCard
              key={stitch.id}
              stitch={stitch}
              demoClips={demoClips}
              isSavingTemplate={savingTemplateStitchId === stitch.id}
              onDelete={onDelete}
              onLoadClip={onLoadClip}
              onLoadPoster={onLoadPoster}
              onLoadVideo={onLoadVideo}
              onPostBridgeScheduled={onPostBridgeScheduled}
              onSaveTemplate={onSaveTemplate}
              onScore={onScore}
              onApplyQuickEdit={onApplyQuickEdit}
              onResetQuickEdit={onResetQuickEdit}
              onUpdateMusic={onUpdateMusic}
              onUpdatePostedStatus={onUpdatePostedStatus}
              onUpdateSocialCaption={onUpdateSocialCaption}
              onUpdateSourceCrop={onUpdateSourceCrop}
              onUpdateSourceCuts={onUpdateSourceCuts}
              onUpdateSourceSettings={onUpdateSourceSettings}
              onUpdateTextOverlay={onUpdateTextOverlay}
              ugcClips={ugcClips}
            />
          ))}
        </div>
      ) : (
        <DashboardEmptyState
          title="No stitches yet"
          description="Create your first stitch after you have at least one UGC and one product demo."
        />
      )}
    </section>
  );
}
