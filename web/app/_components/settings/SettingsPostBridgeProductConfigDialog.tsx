"use client";

import { RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PostBridgeProductAccountConfigRow } from "@/app/_components/settings/PostBridgeProductAccountConfigRow";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";
import { fetchPostBridgeAccountOptions } from "@/lib/clipstitchr/client/fetchPostBridgeAccountOptions";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createPostBridgeProductAccountSelections } from "@/lib/clipstitchr/utils/createPostBridgeProductAccountSelections";

type SettingsPostBridgeProductConfigDialogProps = {
  hasApiKey: boolean;
  isDisabled: boolean;
  products: ProductProfile[];
  onClose: () => void;
};

export function SettingsPostBridgeProductConfigDialog({
  hasApiKey,
  isDisabled,
  products,
  onClose,
}: SettingsPostBridgeProductConfigDialogProps) {
  const updateAccounts = useMutation(
    api.products.updatePostBridgeSocialAccountIds,
  );
  const [accounts, setAccounts] = useState<PostBridgeSocialAccount[]>([]);
  const [selectedAccountIdsByProduct, setSelectedAccountIdsByProduct] =
    useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isBusy = isDisabled || isLoading || savingProductId !== null;

  const loadAccounts = useCallback(async () => {
    if (!hasApiKey) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const options = await fetchPostBridgeAccountOptions();

      setAccounts(options.accounts);
      setSelectedAccountIdsByProduct(
        createPostBridgeProductAccountSelections(products),
      );
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to load connected accounts.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [hasApiKey, products]);

  useEffect(() => {
    void Promise.resolve().then(loadAccounts);
  }, [loadAccounts]);

  const handleAccountChange = (
    productId: string,
    accountId: number,
    checked: boolean,
  ) => {
    setSelectedAccountIdsByProduct((currentSelections) => {
      const currentIds = currentSelections[productId] ?? [];
      const nextIds = checked
        ? [...new Set([...currentIds, accountId])]
        : currentIds.filter((id) => id !== accountId);

      return {
        ...currentSelections,
        [productId]: nextIds,
      };
    });
  };

  const handleSave = async (product: ProductProfile) => {
    setSavingProductId(product.id);
    setError(null);
    setMessage(null);

    try {
      await updateAccounts({
        id: product.id,
        socialAccountIds: selectedAccountIdsByProduct[product.id] ?? [],
        updatedAt: new Date().toISOString(),
      });
      setMessage(`${product.name} posting accounts saved.`);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save posting accounts.",
      );
    } finally {
      setSavingProductId(null);
    }
  };

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-bridge-product-config-dialog-title"
        className="max-h-full w-full max-w-[calc(100vw-1rem)] min-w-0 overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Product links
            </p>
            <h2
              id="post-bridge-product-config-dialog-title"
              className="mt-1 text-xl font-bold text-text-primary"
            >
              Post Bridge accounts
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Choose the accounts each product should use by default.
            </p>
          </div>
          <IconButton
            type="button"
            label="Close Post Bridge account config"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-4 p-4 sm:p-5">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<RefreshCw aria-hidden className="h-4 w-4" />}
              isLoading={isLoading}
              disabled={!hasApiKey || isBusy}
              onClick={() => void loadAccounts()}
            >
              Refresh
            </Button>
          </div>

          {!hasApiKey ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
              Save your Post Bridge key first, then link accounts to each
              product.
            </p>
          ) : null}

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

          {hasApiKey && !products.length ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
              Add a product before linking posting accounts.
            </p>
          ) : null}

          {hasApiKey && products.length && !accounts.length && !isLoading ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
              Connect TikTok, Instagram, or YouTube in Post Bridge, then
              refresh.
            </p>
          ) : null}

          {hasApiKey && isLoading ? (
            <p className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
              Loading connected accounts...
            </p>
          ) : null}

          {hasApiKey && accounts.length ? (
            <div className="flex flex-col gap-3">
              {products.map((product) => (
                <PostBridgeProductAccountConfigRow
                  key={product.id}
                  accounts={accounts}
                  disabled={isBusy}
                  isSaving={savingProductId === product.id}
                  product={product}
                  selectedAccountIds={
                    selectedAccountIdsByProduct[product.id] ??
                    product.postBridgeSocialAccountIds ??
                    []
                  }
                  onAccountChange={handleAccountChange}
                  onSave={(nextProduct) => void handleSave(nextProduct)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
