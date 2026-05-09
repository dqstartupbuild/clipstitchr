"use client";

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
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Avatar
          </span>
          <select
            value={selectedAvatarId}
            className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15"
            onChange={(event) =>
              onSelectedAvatarIdChange(event.currentTarget.value)
            }
          >
            <option value="new">Create new avatar</option>
            {avatars.map((avatar) => (
              <option key={avatar.id} value={avatar.id}>
                {avatar.name}
              </option>
            ))}
          </select>
        </label>
        {selectedAvatarId === "new" ? (
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Avatar name
            </span>
            <input
              type="text"
              value={newAvatarName}
              placeholder="Name this avatar"
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent"
              onChange={(event) =>
                onNewAvatarNameChange(event.currentTarget.value)
              }
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}
