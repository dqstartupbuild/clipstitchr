"use client";

import { useRef, useState } from "react";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";
import { disconnectPublishingIntegration } from "@/lib/clipstitchr/publishing/client/requests/disconnectPublishingIntegration";
import { refreshPublishingIntegration } from "@/lib/clipstitchr/publishing/client/requests/refreshPublishingIntegration";

type PublishingIntegrationRowProps = {
  integration: PublishingIntegration;
  onChanged: () => void;
};

export function PublishingIntegrationRow({
  integration,
  onChanged,
}: PublishingIntegrationRowProps) {
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const workInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const runRefresh = async () => {
    if (workInFlight.current) {
      return;
    }
    workInFlight.current = true;
    setIsWorking(true);
    setError(null);
    try {
      await refreshPublishingIntegration(integration.id);
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Instagram or TikTok could not refresh this connection.");
    } finally {
      workInFlight.current = false;
      setIsWorking(false);
    }
  };

  const runDisconnect = async () => {
    if (workInFlight.current) {
      return;
    }
    workInFlight.current = true;
    setIsWorking(true);
    setError(null);
    try {
      await disconnectPublishingIntegration(integration.id);
      setConfirmDisconnect(false);
      onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "This account could not be disconnected.");
    } finally {
      workInFlight.current = false;
      setIsWorking(false);
    }
  };

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
        <button type="button" disabled={isWorking} onClick={() => void runRefresh()}>
          {isWorking
            ? "Refreshing…"
            : integration.status === "needs-attention"
              ? "Refresh connection"
              : "Refresh"}
        </button>
        <button
          type="button"
          disabled={isWorking}
          onClick={() => setConfirmDisconnect(true)}
        >
          Disconnect
        </button>
      </div>
      {confirmDisconnect ? (
        <div className="publishing-action-confirmation" data-tone="danger" role="alert">
          <p>
            Scheduled posts using this account may stop. Existing provider results stay in Posts.
          </p>
          <div>
            <button type="button" disabled={isWorking} onClick={() => setConfirmDisconnect(false)}>
              Keep account
            </button>
            <button type="button" disabled={isWorking} onClick={() => void runDisconnect()}>
              {isWorking ? "Disconnecting…" : "Disconnect account"}
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="publishing-inline-error" role="alert">{error}</p> : null}
    </article>
  );
}
