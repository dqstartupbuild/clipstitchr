"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { deleteObjectsFromR2 } from "@/lib/clipstitchr/client/r2/deleteObjectsFromR2";

export function useRemoveHookLabPost() {
  const removeMutation = useMutation(api.hookLabPosts.remove.remove);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string) => {
      setDeletingPostId(id);

      try {
        const removedPost = await removeMutation({ id });

        if (removedPost?.thumbnailObject?.key.includes("/hook-lab/")) {
          await deleteObjectsFromR2([removedPost.thumbnailObject]).catch(
            () => undefined,
          );
        }
      } finally {
        setDeletingPostId(null);
      }
    },
    [removeMutation],
  );

  return { deletingPostId, remove };
}
