import type { SocialPublishingSocialAccount } from "@/lib/clipstitchr/types/SocialPublishingSocialAccount";
import { getSocialPublishingPlatformLabel } from "@/lib/clipstitchr/utils/getSocialPublishingPlatformLabel";

type ScheduledPostAccountListProps = {
  accountIds: string[];
  accounts: SocialPublishingSocialAccount[];
};

export function ScheduledPostAccountList({
  accountIds,
  accounts,
}: ScheduledPostAccountListProps) {
  const accountById = new Map(accounts.map((account) => [account.id, account]));

  if (!accountIds.length) {
    return (
      <span className="text-xs font-semibold text-text-tertiary">
        No accounts selected
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {accountIds.map((accountId) => {
        const account = accountById.get(accountId);

        return (
          <span
            key={accountId}
            className="inline-flex max-w-full items-center rounded-md border border-border bg-surface-muted px-2 py-1 text-xs font-semibold text-text-secondary"
          >
            <span className="truncate">
              {account
                ? `${account.username} - ${getSocialPublishingPlatformLabel(account.platform)}`
                : `Account ${accountId}`}
            </span>
          </span>
        );
      })}
    </div>
  );
}
