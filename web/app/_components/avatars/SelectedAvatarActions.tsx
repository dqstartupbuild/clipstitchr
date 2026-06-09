"use client";

import { Check, Edit3, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { CliprVoicePreviewButton } from "@/app/_components/clipr/CliprVoicePreviewButton";
import { IconButton } from "@/app/_components/ui/IconButton";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { avatarWardrobeStyleOptions } from "@/lib/clipstitchr/constants/avatarWardrobeStyleOptions";
import { cliprVoices } from "@/lib/clipstitchr/constants/cliprVoices";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";
import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";

type SelectedAvatarActionsProps = {
  avatar?: Avatar;
  favoriteVoiceId: string;
  isDefaultAvatar: boolean;
  isSaving: boolean;
  photoCount: number;
  onDelete: (avatar: Avatar) => Promise<void>;
  onRename: (avatar: Avatar, name: string) => Promise<void>;
  onWardrobeStyleChange: (
    avatar: Avatar,
    wardrobeStyle: AvatarWardrobeStyle,
  ) => Promise<void>;
  onVoiceChange: (avatar: Avatar, cliprVoiceId: string) => Promise<void>;
  onFavoriteVoiceChange: (cliprVoiceId: string) => Promise<void>;
  onSetDefault: (avatar: Avatar) => Promise<void>;
};

export function SelectedAvatarActions({
  avatar,
  favoriteVoiceId,
  isDefaultAvatar,
  isSaving,
  photoCount,
  onDelete,
  onRename,
  onWardrobeStyleChange,
  onVoiceChange,
  onFavoriteVoiceChange,
  onSetDefault,
}: SelectedAvatarActionsProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenameSaving, setIsRenameSaving] = useState(false);
  const [isWardrobeSaving, setIsWardrobeSaving] = useState(false);
  const [isVoiceSaving, setIsVoiceSaving] = useState(false);
  const [isFavoriteVoiceSaving, setIsFavoriteVoiceSaving] = useState(false);
  const [name, setName] = useState("");
  const [isDefaultSaving, setIsDefaultSaving] = useState(false);

  if (!avatar) {
    return null;
  }

  const trimmedName = name.trim();
  const canSaveName =
    trimmedName.length > 0 &&
    trimmedName !== avatar.name &&
    !isSaving &&
    !isRenameSaving &&
    !isWardrobeSaving &&
    !isVoiceSaving &&
    !isFavoriteVoiceSaving &&
    !isDefaultSaving;
  const photoLabel = photoCount === 1 ? "1 photo" : `${photoCount} photos`;
  const activeVoiceId = getCliprVoiceId(avatar.cliprVoiceId);
  const activeVoice = cliprVoices.find((voice) => voice.id === activeVoiceId);
  const isFavoriteVoice = activeVoiceId === favoriteVoiceId;
  const isDisabled =
    isSaving ||
    isDeleting ||
    isRenameSaving ||
    isWardrobeSaving ||
    isVoiceSaving ||
    isFavoriteVoiceSaving ||
    isDefaultSaving;

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
    <div className="flex flex-wrap items-end gap-1">
      <SelectInput
        label="Outfits"
        value={avatar.wardrobeStyle}
        options={avatarWardrobeStyleOptions}
        wrapperClassName="w-32"
        className="h-10"
        disabled={isDisabled}
        onChange={async (event) => {
          const wardrobeStyle = event.currentTarget.value as AvatarWardrobeStyle;

          if (wardrobeStyle === avatar.wardrobeStyle) {
            return;
          }

          setIsWardrobeSaving(true);

          try {
            await onWardrobeStyleChange(avatar, wardrobeStyle);
          } catch {
            // The parent hook surfaces the error.
          } finally {
            setIsWardrobeSaving(false);
          }
        }}
      />
      <div className="flex items-end gap-1">
        <SelectInput
          label="Voice"
          value={activeVoiceId}
          options={cliprVoices.map((cliprVoice) => ({
            label: cliprVoice.name,
            value: cliprVoice.id,
          }))}
          wrapperClassName="w-36"
          className="h-10"
          disabled={isDisabled}
          onChange={async (event) => {
            const cliprVoiceId = event.currentTarget.value;

            if (cliprVoiceId === activeVoiceId) {
              return;
            }

            setIsVoiceSaving(true);

            try {
              await onVoiceChange(avatar, cliprVoiceId);
            } catch {
              // The parent hook surfaces the error.
            } finally {
              setIsVoiceSaving(false);
            }
          }}
        />
        <CliprVoicePreviewButton
          isCompact
          disabled={isDisabled}
          src={activeVoice?.previewSrc}
          voiceName={activeVoice?.name ?? "selected"}
        />
        <IconButton
          type="button"
          label={
            isFavoriteVoice
              ? `${activeVoice?.name ?? activeVoiceId} is the favorite Clipr voice`
              : `Set ${activeVoice?.name ?? activeVoiceId} as favorite Clipr voice`
          }
          className="h-10 w-10"
          disabled={isDisabled || isFavoriteVoice}
          icon={
            <Star
              aria-hidden
              className="h-4 w-4"
              fill={isFavoriteVoice ? "currentColor" : "none"}
            />
          }
          onClick={async () => {
            setIsFavoriteVoiceSaving(true);

            try {
              await onFavoriteVoiceChange(activeVoiceId);
            } catch {
              // The parent hook surfaces the error.
            } finally {
              setIsFavoriteVoiceSaving(false);
            }
          }}
        />
      </div>
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
      <IconButton
        type="button"
        label={
          isDefaultAvatar
            ? `${avatar.name} is the default avatar`
            : `Set ${avatar.name} as default avatar`
        }
        className="h-10 w-10"
        disabled={isDisabled || isDefaultAvatar}
        icon={
          <Star
            aria-hidden
            className="h-4 w-4"
            fill={isDefaultAvatar ? "currentColor" : "none"}
          />
        }
        onClick={async () => {
          setIsDefaultSaving(true);

          try {
            await onSetDefault(avatar);
          } catch {
            // The parent hook surfaces the error.
          } finally {
            setIsDefaultSaving(false);
          }
        }}
      />
    </div>
  );
}
