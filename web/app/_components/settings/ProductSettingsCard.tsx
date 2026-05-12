"use client";

import { Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { ProductSettingsEditDialog } from "@/app/_components/settings/ProductSettingsEditDialog";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type ProductSettingsCardProps = {
  product: ProductProfile;
  isDisabled: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    input: ProductProfileCreateInput,
  ) => Promise<unknown>;
};

export function ProductSettingsCard({
  product,
  isDisabled,
  isDeleting,
  isSaving,
  onDelete,
  onUpdate,
}: ProductSettingsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const summary =
    product.productDetails || product.audienceDetails || "Saved product";
  const handleDelete = async () => {
    const didConfirm = window.confirm(
      `Delete "${product.name}"?\n\nExisting saved Swipes and generated clips keep their saved snapshots. This cannot be undone.`,
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
      <div className="rounded-lg border border-border bg-surface-elevated p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text-primary">
              {product.name}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">
              {summary}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <IconButton
              label="Edit product"
              icon={<Edit3 aria-hidden className="h-4 w-4" />}
              disabled={isDisabled}
              onClick={() => setIsEditing(true)}
            />
            <IconButton
              label={isDeleting ? "Deleting product" : "Delete product"}
              variant="danger"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              disabled={isDisabled}
              onClick={() => void handleDelete()}
            />
          </div>
        </div>
      </div>
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
