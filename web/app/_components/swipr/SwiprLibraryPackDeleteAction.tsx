"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";

type SwiprLibraryPackDeleteActionProps = {
  isSaving: boolean;
  onDelete: () => void;
};

export function SwiprLibraryPackDeleteAction({
  isSaving,
  onDelete,
}: SwiprLibraryPackDeleteActionProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="danger"
      icon={<Trash2 aria-hidden className="h-4 w-4" />}
      isLoading={isSaving}
      onClick={onDelete}
    >
      Delete pack
    </Button>
  );
}
