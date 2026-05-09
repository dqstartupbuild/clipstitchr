"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

type AvatarFilterSelectProps = {
  avatars: Avatar[];
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function AvatarFilterSelect({
  avatars,
  label,
  value,
  onChange,
}: AvatarFilterSelectProps) {
  const options = [
    { label: "All", value: "all" },
    ...avatars.map((avatar) => ({
      label: avatar.name,
      value: avatar.id,
    })),
  ];

  return (
    <SelectInput
      label={label}
      options={options}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}
