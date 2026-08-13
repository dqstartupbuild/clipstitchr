"use client";

import { useRef, useState } from "react";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { startPublishingConnection } from "@/lib/clipstitchr/publishing/client/requests/startPublishingConnection";
import { readPublishingAuthorizationUrl } from "@/lib/clipstitchr/publishing/client/readPublishingAuthorizationUrl";

export function usePublishingConnectionStart() {
  const [connectingProvider, setConnectingProvider] =
    useState<PublishingProvider | null>(null);
  const connectionInFlight = useRef(false);
  const [connectErrors, setConnectErrors] = useState<
    Partial<Record<PublishingProvider, string>>
  >({});

  return {
    connectErrors,
    connectingProvider,
    connect: async (provider: PublishingProvider) => {
      if (connectionInFlight.current) {
        return;
      }
      connectionInFlight.current = true;
      setConnectingProvider(provider);
      setConnectErrors((current) => ({ ...current, [provider]: undefined }));
      try {
        const response = await startPublishingConnection(provider);
        const safeUrl = readPublishingAuthorizationUrl(
          provider,
          response.authorizationUrl,
          window.location.origin,
        );
        window.location.assign(safeUrl);
      } catch (error) {
        setConnectErrors((current) => ({
          ...current,
          [provider]:
            error instanceof Error
              ? error.message
              : "The provider connection could not start.",
        }));
        connectionInFlight.current = false;
        setConnectingProvider(null);
      }
    },
  } as const;
}
