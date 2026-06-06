"use client";

import { VideoCropEditor } from "@/app/_components/crop/VideoCropEditor";
import type { VideoCropBounds } from "@/lib/clipstitchr/types/VideoCropBounds";

type StitchSourceCropControlProps = {
  title: string;
  value: VideoCropBounds;
  onChange: (cropBounds: VideoCropBounds) => void;
};

export function StitchSourceCropControl({
  title,
  value,
  onChange,
}: StitchSourceCropControlProps) {
  return (
    <VideoCropEditor
      saveLabel="Apply crop"
      showActions={false}
      title={title}
      value={value}
      onCancel={() => undefined}
      onChange={onChange}
      onSave={onChange}
    />
  );
}
