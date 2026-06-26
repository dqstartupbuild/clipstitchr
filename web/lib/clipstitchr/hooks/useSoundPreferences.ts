"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSoundPreferences() {
  const preference = useQuery(api.soundPreferences.get, {});
  const acceptRightsMutation = useMutation(api.soundPreferences.acceptRights);

  return {
    acceptRights: async () => {
      await acceptRightsMutation({ acceptedAt: new Date().toISOString() });
    },
    hasAcceptedRights: Boolean(preference?.rightsAcceptedAt),
    isLoading: preference === undefined,
  };
}
