"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import { createVideoClipSelectOptions } from "@/lib/clipstitchr/utils/createVideoClipSelectOptions";

type StitchSourceClipSelectProps = {
  clips: VideoClipMetadata[];
  fallbackClip: {
    id: string;
    name: string;
  };
  label: string;
  value: string;
  onChange: (clipId: string) => void;
};

export function StitchSourceClipSelect({
  clips,
  fallbackClip,
  label,
  value,
  onChange,
}: StitchSourceClipSelectProps) {
  const options = createVideoClipSelectOptions(clips, fallbackClip);

  return (
    <SelectInput
      label={label}
      options={options}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}
