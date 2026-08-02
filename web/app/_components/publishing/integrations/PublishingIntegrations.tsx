"use client";

import { useRef, useState } from "react";
import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { PublishingProviderConnections } from "@/app/_components/publishing/integrations/PublishingProviderConnections";
import type { PublishingProvider } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProvider";
import { getPublishingIntegrations } from "@/lib/clipstitchr/publishing/client/requests/getPublishingIntegrations";
import { startPublishingConnection } from "@/lib/clipstitchr/publishing/client/requests/startPublishingConnection";
import { readPublishingAuthorizationUrl } from "@/lib/clipstitchr/publishing/client/readPublishingAuthorizationUrl";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";

export function PublishingIntegrations() {
  const resource = usePublishingResource(getPublishingIntegrations, "integrations");
  const [connectingProvider, setConnectingProvider] =
    useState<PublishingProvider | null>(null);
  const connectionInFlight = useRef(false);
  const [connectErrors, setConnectErrors] = useState<
    Partial<Record<PublishingProvider, string>>
  >({});

  const connect = async (provider: PublishingProvider) => {
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
  };

  return (
    <section className="publishing-view" aria-labelledby="publishing-integrations-title">
      <PublishingViewHeader
        description="Connect only the Instagram and TikTok accounts you want ClipStitchr to use."
        title="Integrations"
        titleId="publishing-integrations-title"
      />
      <p className="publishing-reconnect-note">
        Moving from Post Bridge? Reconnect each account once. Old access tokens are not copied into this workspace.
      </p>
      {resource.error ? (
        <PublishingStateMessage
          action={
            <button className="publishing-text-action" type="button" onClick={resource.reload}>
              Try again
            </button>
          }
          message={resource.error}
          title="Connections could not load"
          tone="error"
        />
      ) : resource.isLoading && !resource.data ? (
        <PublishingStateMessage
          message="Checking your Instagram and TikTok connections."
          title="Loading connections"
        />
      ) : resource.data ? (
        <div className="publishing-provider-groups" aria-busy={resource.isLoading}>
          {resource.data.providers.map((group) => (
            <PublishingProviderConnections
              connectError={connectErrors[group.provider] ?? null}
              group={group}
              isConnecting={connectingProvider === group.provider}
              key={group.provider}
              onChanged={resource.reload}
              onConnect={() => void connect(group.provider)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
