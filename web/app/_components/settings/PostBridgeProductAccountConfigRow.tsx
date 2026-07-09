"use client";

import { Save } from "lucide-react";
import { useMemo } from "react";
import { PostBridgeAccountCheckbox } from "@/app/_components/postBridge/PostBridgeAccountCheckbox";
import { Button } from "@/app/_components/ui/Button";
import type { PostBridgeSocialAccount } from "@/lib/clipstitchr/types/PostBridgeSocialAccount";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type PostBridgeProductAccountConfigRowProps = {
  accounts: PostBridgeSocialAccount[];
  disabled: boolean;
  isSaving: boolean;
  product: ProductProfile;
  selectedAccountIds: number[];
  onAccountChange: (
    productId: string,
    accountId: number,
    checked: boolean,
  ) => void;
  onSave: (product: ProductProfile) => void;
};

export function PostBridgeProductAccountConfigRow({
  accounts,
  disabled,
  isSaving,
  product,
  selectedAccountIds,
  onAccountChange,
  onSave,
}: PostBridgeProductAccountConfigRowProps) {
  const selectedAccountIdSet = useMemo(
    () => new Set(selectedAccountIds),
    [selectedAccountIds],
  );
  const accountLabel =
    selectedAccountIds.length === 1
      ? "1 account linked"
      : `${selectedAccountIds.length} accounts linked`;

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-text-primary">
            {product.name}
          </h3>
          <p className="mt-1 text-xs font-semibold text-text-tertiary">
            {accountLabel}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          icon={<Save aria-hidden className="h-4 w-4" />}
          isLoading={isSaving}
          disabled={disabled || !accounts.length}
          onClick={() => onSave(product)}
        >
          Save
        </Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {accounts.map((account) => (
          <PostBridgeAccountCheckbox
            key={account.id}
            account={account}
            checked={selectedAccountIdSet.has(account.id)}
            disabled={disabled || isSaving}
            onChange={(accountId, checked) =>
              onAccountChange(product.id, accountId, checked)
            }
          />
        ))}
      </div>
    </div>
  );
}
