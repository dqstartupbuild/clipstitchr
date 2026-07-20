"use client";

import { X } from "lucide-react";
import { IconButton } from "@/app/_components/ui/IconButton";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { formatDate } from "@/lib/clipstitchr/utils/formatDate";
import { getCliprHookStyleName } from "@/lib/clipstitchr/utils/getCliprHookStyleName";

type ProductSettingsDetailsDialogProps = {
  product: ProductProfile;
  onClose: () => void;
};

export function ProductSettingsDetailsDialog({
  product,
  onClose,
}: ProductSettingsDetailsDialogProps) {
  const detailItems = [
    { label: "Product details", value: product.productDetails },
    { label: "Audience details", value: product.audienceDetails },
    { label: "Emotional narrative", value: product.emotionalNarrative },
    { label: "Website", value: product.websiteUrl },
    {
      label: "Hook style",
      value: getCliprHookStyleName(product.preferredCliprHookStyleKey),
    },
    { label: "Audience problem", value: product.inferredProblem },
  ].flatMap((item) =>
    item.value?.trim()
      ? [
          {
            label: item.label,
            value: item.value.trim(),
          },
        ]
      : [],
  );
  const painPoints = product.inferredPainPoints
    .map((painPoint) => painPoint.trim())
    .filter(Boolean);
  const writingAngles = (product.eligibleCliprHookStyleKeys ?? []).map((key) =>
    getCliprHookStyleName(key),
  );
  const phraseBank = Object.entries(product.cliprPlaceholderFillers ?? {})
    .map(([key, values]) => ({
      key,
      values: values.map((value) => value.trim()).filter(Boolean),
    }))
    .filter((item) => item.values.length);

  return (
    <div
      className="dashboard-dialog-viewport"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-details-dialog-title"
        className="flex max-h-full min-h-0 w-full max-w-[calc(100vw-1rem)] min-w-0 flex-col overflow-hidden rounded-lg bg-white shadow-xl sm:max-w-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex min-w-0 shrink-0 items-start justify-between gap-4 border-b border-border p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Saved product
            </p>
            <h2
              id="product-details-dialog-title"
              className="mt-1 truncate text-xl font-bold text-text-primary"
            >
              {product.name}
            </h2>
          </div>
          <IconButton
            type="button"
            label="Close product details"
            icon={<X aria-hidden className="h-4 w-4" />}
            onClick={onClose}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-5 overflow-x-hidden overflow-y-auto p-4 sm:p-5">
          {detailItems.map((item) => (
            <div key={item.label} className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                {item.label}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere]">
                {item.value}
              </p>
            </div>
          ))}
          {painPoints.length ? (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Pain points
              </p>
              <ul className="mt-2 grid gap-2">
                {painPoints.map((painPoint, index) => (
                  <li
                    key={`${painPoint}-${index}`}
                    className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm leading-5 text-text-secondary"
                  >
                    {painPoint}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {writingAngles.length ? (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Writing angles
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {writingAngles.map((angle, index) => (
                  <span
                    key={`${angle}-${index}`}
                    className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-semibold text-accent-dark"
                  >
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {phraseBank.length ? (
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                Phrase bank
              </p>
              <div className="mt-2 grid gap-3">
                {phraseBank.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-md border border-border bg-surface-muted px-3 py-2"
                  >
                    <p className="text-xs font-bold capitalize text-text-primary">
                      {item.key.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6 text-text-secondary [overflow-wrap:anywhere]">
                      {item.values.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-tertiary">
              Saved {formatDate(product.createdAt)}. Updated{" "}
              {formatDate(product.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
