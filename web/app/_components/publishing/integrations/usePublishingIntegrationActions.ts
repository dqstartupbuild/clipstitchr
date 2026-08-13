"use client";

import { useRef, useState } from "react";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { disconnectPublishingIntegration } from "@/lib/clipstitchr/publishing/client/requests/disconnectPublishingIntegration";
import { refreshPublishingIntegration } from "@/lib/clipstitchr/publishing/client/requests/refreshPublishingIntegration";

export function usePublishingIntegrationActions(
  integration: PublishingIntegration,
  onChanged: () => void,
) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [workingAction, setWorkingAction] = useState<
    "disconnect" | "refresh" | null
  >(null);
  const workInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);

  return {
    confirmDisconnect,
    error,
    isWorking: workingAction !== null,
    setConfirmDisconnect,
    workingAction,
    refresh: async () => {
      if (workInFlight.current) {
        return;
      }
      workInFlight.current = true;
      setWorkingAction("refresh");
      setError(null);
      try {
        await refreshPublishingIntegration(integration.id);
        onChanged();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "The provider could not refresh this connection.",
        );
      } finally {
        workInFlight.current = false;
        setWorkingAction(null);
      }
    },
    disconnect: async () => {
      if (workInFlight.current) {
        return;
      }
      workInFlight.current = true;
      setWorkingAction("disconnect");
      setError(null);
      try {
        await disconnectPublishingIntegration(integration.id);
        setConfirmDisconnect(false);
        onChanged();
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "This account could not be disconnected.",
        );
      } finally {
        workInFlight.current = false;
        setWorkingAction(null);
      }
    },
  } as const;
}
