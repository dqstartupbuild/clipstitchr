"use client";

import { useCallback, useState } from "react";
import { retryHookLabPost } from "@/lib/clipstitchr/client/retryHookLabPost";

export function useRetryHookLabPost() {
  const [retryingPostId, setRetryingPostId] = useState<string | null>(null);

  const retry = useCallback(async (id: string) => {
    setRetryingPostId(id);

    try {
      await retryHookLabPost(id);
    } finally {
      setRetryingPostId(null);
    }
  }, []);

  return { retry, retryingPostId };
}
