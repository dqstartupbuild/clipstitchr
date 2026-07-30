type SocialConsentCheckboxProps = {
  checked: boolean;
  disabled: boolean;
  hasDirectTikTokTarget: boolean;
  hasTikTokBrandedContent: boolean;
  onChange: (checked: boolean) => void;
};

export function SocialConsentCheckbox({
  checked,
  disabled,
  hasDirectTikTokTarget,
  hasTikTokBrandedContent,
  onChange,
}: SocialConsentCheckboxProps) {
  return (
    <label className="flex items-start gap-3 rounded-lg bg-surface-muted p-3 text-sm leading-6 text-text-primary">
      <input
        className="mt-1"
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>
        I reviewed the accounts, media, caption, visibility, interactions, and
        disclosures. I agree to send this post to the selected platforms.
        {hasDirectTikTokTarget ? (
          <span className="mt-1 block font-semibold">
            {hasTikTokBrandedContent
              ? "By posting, you agree to TikTok’s Branded Content Policy and Music Usage Confirmation."
              : "By posting, you agree to TikTok’s Music Usage Confirmation."}
          </span>
        ) : null}
      </span>
    </label>
  );
}
