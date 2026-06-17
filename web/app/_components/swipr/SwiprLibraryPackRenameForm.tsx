"use client";

import { Save } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type SwiprLibraryPackRenameFormProps = {
  draftName: string;
  isSaving: boolean;
  onDraftNameChange: (name: string) => void;
  onSubmit: () => void;
};

export function SwiprLibraryPackRenameForm({
  draftName,
  isSaving,
  onDraftNameChange,
  onSubmit,
}: SwiprLibraryPackRenameFormProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label className="grid gap-1 text-xs font-semibold text-text-secondary">
        Pack name
        <input
          type="text"
          value={draftName}
          className="h-9 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-text-primary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          disabled={isSaving}
          onChange={(event) => onDraftNameChange(event.target.value)}
        />
      </label>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        icon={<Save aria-hidden className="h-4 w-4" />}
        isLoading={isSaving}
        disabled={!draftName.trim()}
        onClick={onSubmit}
      >
        Rename
      </Button>
    </div>
  );
}
