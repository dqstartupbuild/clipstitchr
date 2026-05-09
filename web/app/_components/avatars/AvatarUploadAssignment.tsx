"use client";

import { SelectInput } from "@/app/_components/ui/SelectInput";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

type AvatarUploadAssignmentProps = {
  avatars: Avatar[];
  newAvatarName: string;
  selectedAvatarId: string;
  onNewAvatarNameChange: (name: string) => void;
  onSelectedAvatarIdChange: (id: string) => void;
};

export function AvatarUploadAssignment({
  avatars,
  newAvatarName,
  selectedAvatarId,
  onNewAvatarNameChange,
  onSelectedAvatarIdChange,
}: AvatarUploadAssignmentProps) {
  const options = [
    { label: "Select avatar", value: "" },
    { label: "Create new avatar", value: "new" },
    ...avatars.map((avatar) => ({
      label: avatar.name,
      value: avatar.id,
    })),
  ];

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
      <SelectInput
        label="Avatar"
        options={options}
        value={selectedAvatarId}
        onChange={(event) => onSelectedAvatarIdChange(event.currentTarget.value)}
      />
      {selectedAvatarId === "new" ? (
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Avatar name
          </span>
          <input
            type="text"
            value={newAvatarName}
            placeholder="Name this avatar"
            className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) =>
              onNewAvatarNameChange(event.currentTarget.value)
            }
          />
        </label>
      ) : null}
    </div>
  );
}
