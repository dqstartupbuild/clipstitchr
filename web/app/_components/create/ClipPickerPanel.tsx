"use client";

import { ClipPickerActionBar } from "@/app/_components/create/ClipPickerActionBar";
import { DemoClipSelector } from "@/app/_components/create/DemoClipSelector";
import { UgcClipSelector } from "@/app/_components/create/UgcClipSelector";
import { Panel } from "@/app/_components/ui/Panel";
import type { VideoClip } from "@/lib/clipr/types/VideoClip";

type ClipPickerPanelProps = {
  ugcClips: VideoClip[];
  demoClips: VideoClip[];
  selectedUgcId: string | null;
  selectedDemoId: string | null;
  onSelectUgc: (id: string) => void;
  onSelectDemo: (id: string) => void;
  canCreate: boolean;
  isCreating: boolean;
  onCreate: () => void;
};

export function ClipPickerPanel({
  ugcClips,
  demoClips,
  selectedUgcId,
  selectedDemoId,
  onSelectUgc,
  onSelectDemo,
  canCreate,
  isCreating,
  onCreate,
}: ClipPickerPanelProps) {
  return (
    <Panel className="p-5">
      <ClipPickerActionBar
        canCreate={canCreate}
        isCreating={isCreating}
        onCreate={onCreate}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <UgcClipSelector
          clips={ugcClips}
          selectedId={selectedUgcId}
          onSelect={onSelectUgc}
        />
        <DemoClipSelector
          clips={demoClips}
          selectedId={selectedDemoId}
          onSelect={onSelectDemo}
        />
      </div>
    </Panel>
  );
}
