import { PublishingProviderMark } from "@/app/_components/publishing/common/PublishingProviderMark";
import { PublishingInstagramSettings } from "@/app/_components/publishing/compose/PublishingInstagramSettings";
import { PublishingTikTokSettings } from "@/app/_components/publishing/compose/PublishingTikTokSettings";
import { PublishingYouTubeSettings } from "@/app/_components/publishing/compose/PublishingYouTubeSettings";
import type { PublishingComposerSettings } from "@/lib/clipstitchr/publishing/client/contracts/PublishingComposerSettings";
import type { PublishingDestinationCompatibility } from "@/lib/clipstitchr/publishing/client/contracts/PublishingDestinationCompatibility";
import type { PublishingIntegration } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegration";

type PublishingDestinationEditorProps = {
  compatibility: PublishingDestinationCompatibility | null;
  errors: string[];
  isCheckingCompatibility: boolean;
  onAcknowledgeWarning: (checked: boolean) => void;
  onSettingsChange: (settings: PublishingComposerSettings) => void;
  settings: PublishingComposerSettings;
  thumbnailPrefillError: string | null;
  warningAcknowledged: boolean;
  integration: PublishingIntegration;
};

export function PublishingDestinationEditor({
  compatibility,
  errors,
  isCheckingCompatibility,
  onAcknowledgeWarning,
  onSettingsChange,
  settings,
  thumbnailPrefillError,
  warningAcknowledged,
  integration,
}: PublishingDestinationEditorProps) {
  return (
    <article className="publishing-destination-editor">
      <header>
        <PublishingProviderMark provider={integration.provider} size={28} />
        <span>
          <strong>{integration.displayName}</strong>
          <small>
            {integration.username
              ? `@${integration.username.replace(/^@/, "")}`
              : "Connected account"}
          </small>
        </span>
      </header>

      {settings.provider === "instagram" ? (
        <PublishingInstagramSettings
          onChange={onSettingsChange}
          settings={settings}
        />
      ) : settings.provider === "tiktok" ? (
        <PublishingTikTokSettings
          integrationId={integration.id}
          onChange={onSettingsChange}
          settings={settings}
        />
      ) : (
        <PublishingYouTubeSettings
          integrationId={integration.id}
          onChange={onSettingsChange}
          prefillError={thumbnailPrefillError}
          settings={settings}
        />
      )}

      <section className="publishing-compatibility-result" aria-label="Media check">
        {isCheckingCompatibility && !compatibility ? (
          <p role="status">Checking this saved media for the destination.</p>
        ) : compatibility ? (
          <>
            <strong data-status={compatibility.status}>
              {compatibility.status === "ready"
                ? "Saved media is ready"
                : compatibility.status === "warning"
                  ? "Saved media needs a review"
                  : "Saved media cannot be used here"}
            </strong>
            {compatibility.issues.length ? (
              <ul>
                {compatibility.issues.map((issue) => (
                  <li data-severity={issue.severity} key={`${issue.code}:${issue.message}`}>
                    {issue.message}
                  </li>
                ))}
              </ul>
            ) : null}
            {compatibility.status === "warning" ? (
              <label className="publishing-warning-acknowledgement">
                <input
                  checked={warningAcknowledged}
                  onChange={(event) => onAcknowledgeWarning(event.target.checked)}
                  type="checkbox"
                />
                I reviewed this media warning.
              </label>
            ) : null}
          </>
        ) : (
          <p>The media check has not finished.</p>
        )}
      </section>

      {errors.length ? (
        <ul className="publishing-destination-errors" aria-label="Destination errors">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
