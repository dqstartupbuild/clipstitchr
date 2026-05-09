"use client";

import { Check, Edit3, Trash2, X } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

type SelectedAvatarActionsProps = {
  avatar?: Avatar;
  isSaving: boolean;
  photoCount: number;
  onDelete: (avatar: Avatar) => Promise<void>;
  onRename: (avatar: Avatar, name: string) => Promise<void>;
};

export function SelectedAvatarActions({
  avatar,
  isSaving,
  photoCount,
  onDelete,
  onRename,
}: SelectedAvatarActionsProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const [name, setName] = useState("");

  if (!avatar) {
    return null;
  }

  const trimmedName = name.trim();
  const canSaveName =
    trimmedName.length > 0 &&
    trimmedName !== avatar.name &&
    !isSaving &&
    !isRenameSaving;
  const photoLabel = photoCount === 1 ? "1 photo" : `${photoCount} photos`;
  const isDisabled = isSaving || isDeleting || isRenameSaving;

  const handleDelete = async () => {
    const didConfirm = window.confirm(
      `Delete "${avatar.name}"?\n\nThis will delete all ${photoLabel} for this avatar before deleting the avatar. This cannot be undone.`,
    );

    if (!didConfirm) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete(avatar);
    } catch {
      setIsDeleting(false);
    }
  };

  if (isRenaming) {
    return (
      <form
        className="flex min-w-0 items-center gap-1"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!canSaveName) {
            return;
          }

          setIsRenameSaving(true);

          try {
            await onRename(avatar, trimmedName);
            setIsRenameSaving(false);
            setIsRenaming(false);
          } catch {
            setIsRenameSaving(false);
          }
        }}
      >
        <label className="sr-only" htmlFor="selected-avatar-name">
          Avatar name
        </label>
        <input
          id="selected-avatar-name"
          value={name}
          disabled={isDisabled}
          className="h-10 min-w-0 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary shadow-sm shadow-slate-200/50 outline-none transition-colors hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-44"
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <IconButton
          type="submit"
          label="Save avatar name"
          className="h-10 w-10"
          disabled={!canSaveName}
          icon={<Check aria-hidden className="h-4 w-4" />}
        />
        <IconButton
          type="button"
          label="Cancel rename"
          className="h-10 w-10"
          disabled={isRenameSaving}
          icon={<X aria-hidden className="h-4 w-4" />}
          onClick={() => {
            setName(avatar.name);
            setIsRenaming(false);
          }}
        />
      </form>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <IconButton
        type="button"
        label={`Rename ${avatar.name}`}
        className="h-10 w-10"
        disabled={isDisabled}
        icon={<Edit3 aria-hidden className="h-4 w-4" />}
        onClick={() => {
          setName(avatar.name);
          setIsRenaming(true);
        }}
      />
      <IconButton
        type="button"
        label={`Delete ${avatar.name}`}
        className="h-10 w-10"
        disabled={isDisabled}
        variant="danger"
        icon={<Trash2 aria-hidden className="h-4 w-4" />}
        onClick={() => void handleDelete()}
      />
    </div>
  );
}
