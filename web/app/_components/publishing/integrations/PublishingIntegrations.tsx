"use client";

import { PublishingStateMessage } from "@/app/_components/publishing/common/PublishingStateMessage";
import { PublishingViewHeader } from "@/app/_components/publishing/common/PublishingViewHeader";
import { PublishingProviderConnections } from "@/app/_components/publishing/integrations/PublishingProviderConnections";
import { getPublishingIntegrations } from "@/lib/clipstitchr/publishing/client/requests/getPublishingIntegrations";
import { usePublishingResource } from "@/lib/clipstitchr/publishing/client/usePublishingResource";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { usePublishingConnectionStart } from "./usePublishingConnectionStart";

export function PublishingIntegrations() {
  const { activeProduct, activeProductId } = useDashboardProduct();
  const resource = usePublishingResource(
    getPublishingIntegrations,
    activeProductId ? `integrations:${activeProductId}` : null,
  );
  const connection = usePublishingConnectionStart();

  return (
    <section className="publishing-view" aria-labelledby="publishing-connections-title">
      <PublishingViewHeader
        description={`Connect the Instagram, TikTok, and YouTube accounts you want to use for ${activeProduct?.name ?? "this Product"}.`}
        title="Connections"
        titleId="publishing-connections-title"
      />
      <p className="publishing-reconnect-note">
        Moving from Post Bridge? Reconnect each account once. Existing account connections are not carried into this workspace.
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
          message="Checking your Instagram, TikTok, and YouTube connections."
          title="Loading connections"
        />
      ) : resource.data ? (
        <div className="publishing-provider-groups" aria-busy={resource.isLoading}>
          {resource.data.providers.map((group) => (
            <PublishingProviderConnections
              connectError={connection.connectErrors[group.provider] ?? null}
              connectionBusy={connection.connectingProvider !== null}
              group={group}
              isConnecting={connection.connectingProvider === group.provider}
              key={group.provider}
              onChanged={resource.reload}
              onConnect={() => void connection.connect(group.provider)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
