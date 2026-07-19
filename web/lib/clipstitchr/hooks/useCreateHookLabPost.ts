"use client";

import { useCallback, useState } from "react";
import { createHookLabPost } from "@/lib/clipstitchr/client/createHookLabPost";

export function useCreateHookLabPost() {
  const [isCreating, setIsCreating] = useState(false);

  const create = useCallback(async (url: string) => {
    setIsCreating(true);

    try {
      return await createHookLabPost(url);
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { create, isCreating };
}
