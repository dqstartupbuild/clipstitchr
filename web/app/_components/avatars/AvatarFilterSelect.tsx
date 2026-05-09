"use client";

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
  return (
    <label className="block">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <select
        value={value}
        className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        <option value="all">All</option>
        {avatars.map((avatar) => (
          <option key={avatar.id} value={avatar.id}>
            {avatar.name}
          </option>
        ))}
      </select>
    </label>
  );
}
