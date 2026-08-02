import { PublishingIntegrationRow } from "@/app/_components/publishing/integrations/PublishingIntegrationRow";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingProviderGroup } from "@/lib/clipstitchr/publishing/client/contracts/PublishingProviderGroup";
import { getPublishingProviderName } from "@/lib/clipstitchr/publishing/client/getPublishingProviderName";

type PublishingProviderConnectionsProps = {
  connectError: string | null;
  group: PublishingProviderGroup;
  isConnecting: boolean;
  onChanged: () => void;
  onConnect: () => void;
};

export function PublishingProviderConnections({
  connectError,
  group,
  isConnecting,
  onChanged,
  onConnect,
}: PublishingProviderConnectionsProps) {
  const name = getPublishingProviderName(group.provider);

  return (
    <section className="publishing-provider-connections" aria-labelledby={`publishing-${group.provider}-connections`}>
      <header>
        <div>
          <PublishingProviderMark provider={group.provider} size={32} />
          <div>
            <h2 id={`publishing-${group.provider}-connections`}>{name}</h2>
            <p>
              {group.integrations.length
                ? `${group.integrations.length} connected ${group.integrations.length === 1 ? "account" : "accounts"}`
                : "No account connected"}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!group.canConnect || isConnecting}
          onClick={onConnect}
          aria-describedby={!group.canConnect ? `publishing-${group.provider}-unavailable` : undefined}
        >
          {isConnecting ? "Opening provider…" : `Connect ${name}`}
        </button>
      </header>
      {!group.canConnect ? (
        <p id={`publishing-${group.provider}-unavailable`} className="publishing-provider-unavailable">
          {group.unavailableReason || `${name} connections are not available right now.`}
        </p>
      ) : null}
      {connectError ? <p className="publishing-inline-error" role="alert">{connectError}</p> : null}
      {group.integrations.length ? (
        <div className="publishing-integration-list">
          {group.integrations.map((integration) => (
            <PublishingIntegrationRow
              integration={integration}
              key={integration.id}
              onChanged={onChanged}
            />
          ))}
        </div>
      ) : (
        <p className="publishing-provider-empty">
          Connect once, then choose this account when you create a post.
        </p>
      )}
    </section>
  );
}
