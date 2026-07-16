"use client";

import { Archive, Edit3, Star } from "lucide-react";
import { useState } from "react";
import { ProductSettingsDetailsDialog } from "@/app/_components/settings/ProductSettingsDetailsDialog";
import { ProductSettingsEditDialog } from "@/app/_components/settings/ProductSettingsEditDialog";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { getCliprHookStyleName } from "@/lib/clipstitchr/utils/getCliprHookStyleName";

type ProductSettingsCardProps = {
  product: ProductProfile;
  isDefault: boolean;
  isDefaulting: boolean;
  isDisabled: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (product: ProductProfile) => Promise<void>;
  onUpdate: (id: string, input: ProductProfileCreateInput) => Promise<unknown>;
};

export function ProductSettingsCard({
  product,
  isDefault,
  isDefaulting,
  isDisabled,
  isDeleting,
  isSaving,
  onDelete,
  onSetDefault,
  onUpdate,
}: ProductSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const summary =
    product.productDetails ||
    product.emotionalNarrative ||
    product.audienceDetails ||
    "Saved product";
  const hookStyleName = getCliprHookStyleName(
    product.preferredCliprHookStyleKey,
  );
  const handleDelete = async () => {
    const didConfirm = window.confirm(
      `Archive "${product.name}"?\n\nIts saved work stays put, and you can restore it later when your plan has room.`,
    );

    if (!didConfirm) {
      return;
    }

    try {
      await onDelete(product.id);
    } catch {
      return;
    }
  };

  return (
    <>
      <div
        className="cursor-pointer rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:border-accent focus-within:border-accent"
        onClick={() => setIsViewingDetails(true)}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            title={`Open ${product.name} details`}
            className="min-w-0 flex-1 rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={(event) => {
              event.stopPropagation();
              setIsViewingDetails(true);
            }}
          >
            <span className="block truncate text-sm font-bold text-text-primary">
              {product.name}
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-text-secondary">
              {summary}
            </span>
            <span className="mt-1 block text-xs font-semibold text-text-tertiary">
              Hook style: {hookStyleName}
            </span>
            {isDefault ? (
              <span className="mt-1 block text-xs font-bold text-accent-dark">
                Active product
              </span>
            ) : null}
          </button>
          <div
            className="flex shrink-0 gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <IconButton
              label={
                isDefault
                  ? `${product.name} is active`
                  : isDefaulting
                    ? "Making product active"
                    : `Make ${product.name} active`
              }
              icon={
                <Star
                  aria-hidden
                  className="h-4 w-4"
                  fill={isDefault ? "currentColor" : "none"}
                />
              }
              disabled={isDisabled || isDefault}
              onClick={() => void onSetDefault(product)}
            />
            <IconButton
              label="Edit product"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              disabled={isDisabled}
              onClick={() => setIsEditing(true)}
            />
            <IconButton
              label={isDeleting ? "Archiving product" : "Archive product"}
              icon={<Archive aria-hidden className="h-4 w-4" />}
              disabled={isDisabled}
              onClick={() => void handleDelete()}
            />
          </div>
        </div>
      </div>
      {isViewingDetails ? (
        <ProductSettingsDetailsDialog
          product={product}
          onClose={() => setIsViewingDetails(false)}
        />
      ) : null}
      {isEditing ? (
        <ProductSettingsEditDialog
          product={product}
          isSaving={isSaving}
          onClose={() => setIsEditing(false)}
          onSave={async (input) => {
            await onUpdate(product.id, input);
            setIsEditing(false);
          }}
        />
      ) : null}
    </>
  );
}
