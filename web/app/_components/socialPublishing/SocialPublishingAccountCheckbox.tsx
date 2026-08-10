import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

type SocialPublishingAccountCheckboxProps = {
  account: SocialPublishingSocialAccount;
  checked: boolean;
  disabled?: boolean;
  onChange: (accountId: string, checked: boolean) => void;
};

export function SocialPublishingAccountCheckbox({
  account,
  checked,
  disabled = false,
  onChange,
}: SocialPublishingAccountCheckboxProps) {
  const isUnavailable =
    !account.isActive ||
    account.needsReconnection ||
    account.tiktokCanPostMore === false ||
    (account.platform === "tiktok" && !account.tiktokPrivacyLevels?.length);
  const accountStatus = account.needsReconnection
    ? "Reconnect in Zernio"
    : account.tiktokCanPostMore === false
      ? "TikTok daily limit reached"
      : account.platform === "tiktok" && !account.tiktokPrivacyLevels?.length
        ? "TikTok details unavailable"
      : getSocialPublishingPlatformLabel(account.platform);

  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary">
      <input
        type="checkbox"
        className="h-4 w-4 accent-accent"
        checked={checked}
        disabled={disabled || isUnavailable}
        onChange={(event) => onChange(account.id, event.target.checked)}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{account.username}</span>
        <span className="mt-0.5 block text-xs text-text-tertiary">
          {accountStatus}
        </span>
      </span>
    </label>
  );
}
