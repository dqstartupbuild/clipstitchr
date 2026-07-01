"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import { createId } from "@/lib/clipstitchr/utils/createId";
import { getStitchTemplateDefaultName } from "@/lib/clipstitchr/utils/getStitchTemplateDefaultName";

export function useCreateStitchTemplate() {
  const createFromStitchMutation = useMutation(
    api.stitchTemplates.createFromStitch.createFromStitch,
  );
  const [error, setError] = useState<string | null>(null);
  const [savingStitchId, setSavingStitchId] = useState<string | null>(null);
  const createTemplateFromStitch = useCallback(
    async (stitch: Stitch) => {
      const templateId = createId();

      setError(null);
      setSavingStitchId(stitch.id);

      try {
        await createFromStitchMutation({
          id: templateId,
          name: getStitchTemplateDefaultName(stitch),
          stitchId: stitch.id,
        });
        return templateId;
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Could not save that template.",
        );
        throw nextError;
      } finally {
        setSavingStitchId(null);
      }
    },
    [createFromStitchMutation],
  );

  return {
    error,
    savingStitchId,
    createTemplateFromStitch,
  };
}
