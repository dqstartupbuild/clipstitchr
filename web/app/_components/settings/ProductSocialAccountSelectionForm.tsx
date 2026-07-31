"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SocialPlatformMark } from "@/app/_components/social/SocialPlatformMark";
import { Button } from "@/app/_components/ui/Button";
import type { SocialComposeAccount } from "@/lib/clipstitchr/social/types/SocialComposeAccount";

type ProductSocialAccountSelectionFormProps = {
  accounts: SocialComposeAccount[];
  initialSelectedIds: string[];
  onSaved: () => void;
  productId: string;
};

export function ProductSocialAccountSelectionForm({
  accounts,
  initialSelectedIds,
  onSaved,
  productId,
}: ProductSocialAccountSelectionFormProps) {
  const saveSelections = useMutation(
    api.productSocialAccounts.setProductSocialAccounts
      .setProductSocialAccounts,
  );
  const connectedAccounts = accounts.filter(
    (account) => account.status === "connected",
  );
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveSelections({
        productId,
        accountIds: selectedIds,
        now: new Date().toISOString(),
      });
      onSaved();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save default accounts.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {connectedAccounts.length > 0 ? (
          connectedAccounts.map((account) => (
            <label
              key={account.id}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-surface-elevated px-3 py-2 text-sm text-text-primary"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(account.id)}
                disabled={isSaving}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;

                  setSelectedIds((current) =>
                    checked
                      ? [...current, account.id]
                      : current.filter((id) => id !== account.id),
                  );
                }}
              />
              <SocialPlatformMark
                platform={account.platform}
                className="h-4 w-4 shrink-0"
              />
              <span className="min-w-0 truncate font-semibold">
                {account.displayName || account.username}
              </span>
            </label>
          ))
        ) : (
          <p className="text-sm leading-6 text-text-secondary sm:col-span-2">
            Connect a social account above before choosing product defaults.
          </p>
        )}
      </div>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3">
        <Button
          type="button"
          size="sm"
          isLoading={isSaving}
          onClick={() => void handleSave()}
        >
          Save default accounts
        </Button>
      </div>
    </>
  );
}
