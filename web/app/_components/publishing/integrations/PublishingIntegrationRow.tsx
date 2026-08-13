"use client";

import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { usePublishingIntegrationActions } from "./usePublishingIntegrationActions";

type PublishingIntegrationRowProps = {
  integration: PublishingIntegration;
  onChanged: () => void;
};

export function PublishingIntegrationRow({
  integration,
  onChanged,
}: PublishingIntegrationRowProps) {
  const actions = usePublishingIntegrationActions(integration, onChanged);

  return (
    <article className="publishing-integration-row">
      <div className="publishing-integration-identity">
        <PublishingProviderMark provider={integration.provider} size={28} />
        <div>
          <strong>{integration.displayName}</strong>
          <span>{integration.username ? `@${integration.username.replace(/^@/, "")}` : "Connected account"}</span>
        </div>
      </div>
      <div className="publishing-integration-status" data-status={integration.status}>
        <strong>{integration.status === "connected" ? "Ready" : "Needs attention"}</strong>
        {integration.statusMessage ? <span>{integration.statusMessage}</span> : null}
      </div>
      <div className="publishing-integration-actions">
        <button type="button" disabled={actions.isWorking} onClick={() => void actions.refresh()}>
          {actions.workingAction === "refresh"
            ? "Refreshing…"
            : integration.status === "needs-attention"
              ? "Refresh connection"
              : "Refresh"}
        </button>
        <button
          type="button"
          disabled={actions.isWorking}
          onClick={() => actions.setConfirmDisconnect(true)}
        >
          Disconnect
        </button>
      </div>
      {actions.confirmDisconnect ? (
        <div className="publishing-action-confirmation" data-tone="danger" role="alert">
          <p>
            Scheduled posts using this account may stop. Existing provider results stay in Posts.
          </p>
          <div>
            <button type="button" disabled={actions.isWorking} onClick={() => actions.setConfirmDisconnect(false)}>
              Keep account
            </button>
            <button type="button" disabled={actions.isWorking} onClick={() => void actions.disconnect()}>
              {actions.workingAction === "disconnect" ? "Disconnecting…" : "Disconnect account"}
            </button>
          </div>
        </div>
      ) : null}
      {actions.isWorking ? (
        <p className="publishing-action-status" role="status">
          {actions.workingAction === "disconnect"
            ? "Disconnecting this provider account."
            : "Refreshing this provider connection."}
        </p>
      ) : null}
      {actions.error ? <p className="publishing-inline-error" role="alert">{actions.error}</p> : null}
    </article>
  );
}
