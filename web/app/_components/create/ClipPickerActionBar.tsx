"use client";

import { Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type ClipPickerActionBarProps = {
  canCreate: boolean;
  isCreating: boolean;
  onCreate: () => void;
};

export function ClipPickerActionBar({
  canCreate,
  isCreating,
  onCreate,
}: ClipPickerActionBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-accent-dark">Create</p>
        <h2 className="mt-2 text-lg font-bold text-text-primary">
          Stitch selected clips
        </h2>
      </div>
      <Button
        type="button"
        disabled={!canCreate}
        isLoading={isCreating}
        icon={<Plus aria-hidden className="h-4 w-4" />}
        onClick={onCreate}
      >
        Create
      </Button>
    </div>
  );
}
