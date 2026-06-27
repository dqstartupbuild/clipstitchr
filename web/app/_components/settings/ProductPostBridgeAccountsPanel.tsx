"use client";

import { RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostBridgeAccountCheckbox } from "@/app/_components/postBridge/PostBridgeAccountCheckbox";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ProductPostBridgeAccountsPanelProps = {
  isDisabled: boolean;
  product?: ProductProfile;
};

export function ProductPostBridgeAccountsPanel({
  isDisabled,
  product,
}: ProductPostBridgeAccountsPanelProps) {
  const updateAccounts = useMutation(
    api.products.updatePostBridgeSocialAccountIds,
  );
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const selectedAccountIdSet = useMemo(
    () => new Set(selectedAccountIds),
    [selectedAccountIds],
  );

  const loadAccounts = useCallback(async () => {
    if (!product) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const options = await fetchPostBridgeAccountOptions(product.id);

      setAccounts(options.accounts);
      setSelectedAccountIds(options.defaultSocialAccountIds);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load connected accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [product]);

  useEffect(() => {
    if (!product) {
      return;
    }

    void Promise.resolve().then(loadAccounts);
  }, [loadAccounts, product]);

  const handleAccountChange = (accountId: number, checked: boolean) => {
    setSelectedAccountIds((currentIds) =>
      checked
        ? [...new Set([...currentIds, accountId])]
        : currentIds.filter((id) => id !== accountId),
    );
  };

  const handleSave = async () => {
    if (!product) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await updateAccounts({
        id: product.id,
        socialAccountIds: selectedAccountIds,
        updatedAt: new Date().toISOString(),
      });
      setMessage("Posting accounts saved.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save posting accounts.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel className="p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              Posting accounts
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              {product ? product.name : "Choose a product"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Pick where this product should post by default.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<RefreshCw aria-hidden className="h-4 w-4" />}
            isLoading={isLoading}
            disabled={!product || isDisabled || isSaving}
            onClick={() => void loadAccounts()}
          >
            Refresh
          </Button>
        </div>

        {product && accounts.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {accounts.map((account) => (
              <PostBridgeAccountCheckbox
                key={account.id}
                account={account}
                checked={selectedAccountIdSet.has(account.id)}
                disabled={isDisabled || isLoading || isSaving}
                onChange={handleAccountChange}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
            Add your Post Bridge key in account settings, then connect TikTok,
            Instagram, or YouTube in Post Bridge.
          </p>
        )}

        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            icon={<Save aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={!product || isDisabled || isLoading || !accounts.length}
            onClick={() => void handleSave()}
          >
            Save accounts
          </Button>
        </div>
      </div>
    </Panel>
  );
}
