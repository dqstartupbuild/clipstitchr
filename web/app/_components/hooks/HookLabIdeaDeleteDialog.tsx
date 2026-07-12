"use client";

import { Trash2, X } from "lucide-react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useState } from "react";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type HookLabIdeaDeleteDialogProps = {
  ideaName: string;
  isDeleting: boolean;
  isWorking: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export function HookLabIdeaDeleteDialog({
  ideaName,
  isDeleting,
  isWorking,
  onClose,
  onDelete,
}: HookLabIdeaDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div
        aria-labelledby="hook-lab-delete-title"
        aria-describedby="hook-lab-delete-description"
        aria-modal="true"
        className="w-full max-w-md rounded-lg border border-border bg-white p-5 shadow-xl"
        role="alertdialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="hook-lab-delete-title"
              className="text-balance text-lg font-bold text-text-primary"
            >
              Delete this idea?
            </h2>
            <p
              id="hook-lab-delete-description"
              className="mt-2 text-pretty text-sm leading-6 text-text-secondary"
            >
              {isWorking
                ? `Hook Lab is still working on “${ideaName}.” Let it finish before deleting this idea.`
                : `“${ideaName}” will leave Hook Lab. Your source Stitch, clips, and finished videos will stay right where they are.`}
            </p>
          </div>
          <IconButton
            label="Close delete idea dialog"
            icon={<X aria-hidden className="size-4" />}
            disabled={isDeleting}
            onClick={onClose}
          />
        </div>
        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-pretty text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isDeleting}
            onClick={onClose}
          >
            Keep idea
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={<Trash2 aria-hidden className="size-4" />}
            disabled={isWorking}
            isLoading={isDeleting}
            onClick={() => {
              setError(null);
              void onDelete().catch((nextError) =>
                setError(
                  getErrorMessage(nextError, "Unable to delete that idea."),
                ),
              );
            }}
          >
            {isWorking ? "Still working" : "Delete idea"}
          </Button>
        </div>
      </div>
    </div>
  );
}
