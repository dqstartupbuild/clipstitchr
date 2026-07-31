import { SocialPlatformMark } from "./SocialPlatformMark";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";

type SocialComposeAccountPickerProps = {
  accounts: SocialComposeAccount[];
  disabled: boolean;
  selectedAccountIds: string[];
  onChange: (account: SocialComposeAccount, checked: boolean) => void;
};

export function SocialComposeAccountPicker({
  accounts,
  disabled,
  selectedAccountIds,
  onChange,
}: SocialComposeAccountPickerProps) {
  const connectedAccounts = accounts.filter(
    (account) => account.status === "connected",
  );

  return (
    <fieldset disabled={disabled}>
      <legend className="text-sm font-bold text-text-primary">Accounts</legend>
      {connectedAccounts.length > 0 ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {connectedAccounts.map((account) => (
            <label
              key={account.id}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-primary"
            >
              <input
                type="checkbox"
                checked={selectedAccountIds.includes(account.id)}
                onChange={(event) =>
                  onChange(account, event.currentTarget.checked)
                }
              />
              <SocialPlatformMark
                platform={account.platform}
                className="h-4 w-4 shrink-0"
              />
              <span className="min-w-0">
                <span className="block truncate font-semibold">
                  {account.displayName || account.username}
                </span>
                <span className="block truncate text-xs text-text-tertiary">
                  @{account.username}
                </span>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm text-text-secondary">
          Connect TikTok or Instagram in Settings before scheduling.
        </p>
      )}
    </fieldset>
  );
}
