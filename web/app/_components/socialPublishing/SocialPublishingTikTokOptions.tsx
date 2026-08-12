import { DashboardAlert } from "@/app/_components/dashboard/DashboardAlert";
import type { SocialPublishingTikTokCommercialContentType } from "@/lib/clipstitchr/types/SocialPublishingTikTokCommercialContentType";

type SocialPublishingTikTokOptionsProps = {
  commercialContentType: SocialPublishingTikTokCommercialContentType;
  consentGiven: boolean;
  consentLabel: string;
  disabled?: boolean;
  privacyLevel: string;
  privacyLevels: { label: string; value: string }[];
  onCommercialContentTypeChange: (
    value: SocialPublishingTikTokCommercialContentType,
  ) => void;
  onConsentGivenChange: (value: boolean) => void;
  onPrivacyLevelChange: (value: string) => void;
};

export function SocialPublishingTikTokOptions({
  commercialContentType,
  consentGiven,
  consentLabel,
  disabled = false,
  privacyLevel,
  privacyLevels,
  onCommercialContentTypeChange,
  onConsentGivenChange,
  onPrivacyLevelChange,
}: SocialPublishingTikTokOptionsProps) {
  return (
    <fieldset className="grid gap-3 rounded-lg bg-surface-muted p-3">
      <legend className="px-1 text-sm font-bold text-text-primary">
        TikTok settings
      </legend>
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Who can watch
        <select
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={privacyLevel}
          disabled={disabled || !privacyLevels.length}
          onChange={(event) => onPrivacyLevelChange(event.target.value)}
        >
          {privacyLevels.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-text-primary">
        Promotional content
        <select
          className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-accent"
          value={commercialContentType}
          disabled={disabled}
          onChange={(event) =>
            onCommercialContentTypeChange(
              event.target.value as SocialPublishingTikTokCommercialContentType,
            )
          }
        >
          <option value="brand_organic">Promotes my own brand</option>
          <option value="none">Not promotional</option>
          <option value="brand_content">Paid partnership or another brand</option>
        </select>
      </label>
      <label className="flex items-start gap-2 text-sm font-semibold leading-5 text-text-primary">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          checked={consentGiven}
          disabled={disabled}
          onChange={(event) => onConsentGivenChange(event.target.checked)}
        />
        <span>{consentLabel}</span>
      </label>
      {!privacyLevels.length ? (
        <DashboardAlert variant="error">
          TikTok posting details could not be loaded. Refresh your Zernio
          connection and try again.
        </DashboardAlert>
      ) : null}
    </fieldset>
  );
}
