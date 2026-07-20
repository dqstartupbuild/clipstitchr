"use client";

import { Lock, X } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/app/_components/ui/IconButton";
import { useDialogFocusManagement } from "@/lib/clipstitchr/hooks/useDialogFocusManagement";
import type { ProductLimitDialogReason } from "@/lib/clipstitchr/types/ProductLimitDialogReason";

type ProductPlanLimitDialogProps = {
  planName: string | null;
  productLimit: number | null;
  reason: ProductLimitDialogReason;
  onClose: () => void;
};

export function ProductPlanLimitDialog({
  planName,
  productLimit,
  reason,
  onClose,
}: ProductPlanLimitDialogProps) {
  const dialogRef = useDialogFocusManagement(onClose);
  const resolvedPlanName = planName ?? "Your current plan";
  const productWord = productLimit === 1 ? "product" : "products";
  const title =
    reason.kind === "locked"
      ? `${reason.productName} is locked`
      : "You need another product slot";
  const message =
    reason.kind === "locked"
      ? `${resolvedPlanName} includes ${productLimit ?? "a limited number of"} ${productWord}. This product is still saved, but it cannot be selected until your plan has room for it.`
      : `${resolvedPlanName} includes ${productLimit ?? "a limited number of"} ${productWord}. Review your subscription to add another product.`;

  return (
    <div
      className="product-plan-limit-theme dashboard-dialog-viewport dashboard-dialog-viewport-notification"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        aria-labelledby="product-plan-limit-title"
        aria-describedby="product-plan-limit-message"
        aria-modal="true"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <Lock aria-hidden className="mt-1 h-5 w-5 shrink-0 text-text-tertiary" />
          <div className="min-w-0 flex-1">
            <h2
              id="product-plan-limit-title"
              className="text-lg font-bold text-text-primary"
            >
              {title}
            </h2>
            <p
              id="product-plan-limit-message"
              className="mt-2 text-sm leading-6 text-text-secondary"
            >
              {message}
            </p>
          </div>
          <IconButton
            type="button"
            label="Close product limit message"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <Link
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-text-inverse transition-colors hover:bg-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          href="/dashboard/settings#plan-and-usage"
          onClick={onClose}
        >
          Review subscription
        </Link>
      </div>
    </div>
  );
}
