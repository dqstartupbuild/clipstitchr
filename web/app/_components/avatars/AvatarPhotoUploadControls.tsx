"use client";

import { Save } from "lucide-react";
import { AvatarUploadAssignment } from "@/app/_components/avatars/AvatarUploadAssignment";
import { Button } from "@/app/_components/ui/Button";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

type AvatarPhotoUploadControlsProps = {
  avatars: Avatar[];
  canSave: boolean;
  isSaving: boolean;
  newAvatarName: string;
  pendingFileCount: number;
  selectedAvatarId: string;
  shouldExpandWithAi: boolean;
  onNewAvatarNameChange: (name: string) => void;
  onSave: () => void;
  onSelectedAvatarIdChange: (id: string) => void;
};

export function AvatarPhotoUploadControls({
  avatars,
  canSave,
  isSaving,
  newAvatarName,
  pendingFileCount,
  selectedAvatarId,
  shouldExpandWithAi,
  onNewAvatarNameChange,
  onSave,
  onSelectedAvatarIdChange,
}: AvatarPhotoUploadControlsProps) {
  const hasPendingFiles = pendingFileCount > 0;
  const pendingFileLabel =
    pendingFileCount === 1 ? "1 photo ready" : `${pendingFileCount} photos ready`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end">
      <AvatarUploadAssignment
        avatars={avatars}
        newAvatarName={newAvatarName}
        selectedAvatarId={selectedAvatarId}
        onNewAvatarNameChange={onNewAvatarNameChange}
        onSelectedAvatarIdChange={onSelectedAvatarIdChange}
      />
      <div>
        <p className="text-xs font-semibold text-text-tertiary">
          {hasPendingFiles ? pendingFileLabel : "Ready for photos"}
        </p>
        {hasPendingFiles ? (
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            Fill {shouldExpandWithAi ? "on" : "off"}
          </p>
        ) : null}
        <Button
          type="button"
          className="mt-2 w-full"
          icon={<Save aria-hidden className="h-4 w-4" />}
          isLoading={isSaving}
          disabled={!canSave}
          onClick={onSave}
        >
          Save Photos
        </Button>
      </div>
    </div>
  );
}
