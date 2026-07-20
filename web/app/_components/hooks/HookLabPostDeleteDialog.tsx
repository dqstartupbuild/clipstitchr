"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";
import { getHookLabPostTitle } from "@/lib/clipstitchr/utils/getHookLabPostTitle";

type HookLabPostDeleteDialogProps = {
  isDeleting: boolean;
  post: HookLabPost;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

export function HookLabPostDeleteDialog({
  isDeleting,
  post,
  onClose,
  onDelete,
}: HookLabPostDeleteDialogProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className="dashboard-dialog-viewport"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        aria-describedby="hook-lab-post-delete-description"
        aria-labelledby="hook-lab-post-delete-title"
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        role="alertdialog"
      >
        <h2
          className="text-xl font-bold text-text-primary"
          id="hook-lab-post-delete-title"
        >
          Delete this post?
        </h2>
        <p
          className="mt-2 text-sm leading-6 text-text-secondary"
          id="hook-lab-post-delete-description"
        >
          {getHookLabPostTitle(post)} and its analysis will be removed from Hook
          Lab.
        </p>
        {error ? (
          <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            disabled={isDeleting}
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Keep post
          </Button>
          <Button
            isLoading={isDeleting}
            type="button"
            variant="danger"
            onClick={() => {
              setError(null);
              void onDelete()
                .then(onClose)
                .catch((nextError) =>
                  setError(
                    getErrorMessage(nextError, "Unable to delete that post."),
                  ),
                );
            }}
          >
            Delete post
          </Button>
        </div>
      </div>
    </div>
  );
}
