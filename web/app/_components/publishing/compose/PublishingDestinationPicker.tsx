import Link from "next/link";
import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";

type PublishingDestinationPickerProps = {
  integrations: PublishingIntegration[];
  onToggle: (integration: PublishingIntegration) => void;
  selectedIds: string[];
};

export function PublishingDestinationPicker({
  integrations,
  onToggle,
  selectedIds,
}: PublishingDestinationPickerProps) {
  if (!integrations.length) {
    return (
      <div className="publishing-composer-no-destinations">
        <p>Connect Instagram or TikTok before choosing where this should go.</p>
        <Link href="/dashboard/publishing/integrations">Open integrations</Link>
      </div>
    );
  }

  return (
    <fieldset className="publishing-destination-picker">
      <legend>Destinations</legend>
      {integrations.map((integration) => {
        const selected = selectedIds.includes(integration.id);
        const disabled = integration.status !== "connected" && !selected;
        return (
          <label key={integration.id}>
            <input
              checked={selected}
              disabled={disabled}
              onChange={() => onToggle(integration)}
              type="checkbox"
            />
            <PublishingProviderMark provider={integration.provider} size={24} />
            <span>
              <strong>{integration.displayName}</strong>
              <small>
                {disabled
                  ? integration.statusMessage || "Reconnect this account first."
                  : integration.username
                    ? `@${integration.username.replace(/^@/, "")}`
                    : "Ready"}
              </small>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
