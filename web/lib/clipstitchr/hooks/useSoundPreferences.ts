"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSoundPreferences(enabled = true) {
  const preference = useQuery(api.soundPreferences.get, enabled ? {} : "skip");
  const acceptRightsMutation = useMutation(api.soundPreferences.acceptRights);

  return {
    acceptRights: async () => {
      await acceptRightsMutation({ acceptedAt: new Date().toISOString() });
    },
    hasAcceptedRights: Boolean(preference?.rightsAcceptedAt),
    isLoading: enabled && preference === undefined,
  };
}
