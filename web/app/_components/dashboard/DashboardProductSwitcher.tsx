"use client";

import { Check, ChevronDown, Package, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ProductCreateDialog } from "@/app/_components/products/ProductCreateDialog";
import { useDashboardProduct } from "@/lib/clipstitchr/hooks/useDashboardProduct";
import { getProductInitials } from "@/lib/clipstitchr/utils/getProductInitials";

export function DashboardProductSwitcher() {
  const {
    activeProduct,
    createProduct,
    error,
    isCreating,
    isLoading,
    products,
    setActiveProduct,
  } = useDashboardProduct();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="dashboard-product-switcher relative min-w-0">
      <button
        type="button"
        className="dashboard-product-switcher-trigger flex w-full min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-left transition-colors hover:border-border-hover"
        disabled={isLoading}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="dashboard-product-switcher-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-accent-dark">
          {activeProduct ? (
            getProductInitials(activeProduct.name)
          ) : (
            <Package aria-hidden className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-text-tertiary">
            Active product
          </span>
          <span className="block truncate text-sm font-bold text-text-primary">
            {activeProduct?.name ?? (isLoading ? "Loading" : "No product yet")}
          </span>
        </span>
        <ChevronDown aria-hidden className="h-4 w-4 shrink-0 text-text-tertiary" />
      </button>
      {isOpen ? (
        <div className="dashboard-product-switcher-menu absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-border bg-surface shadow-2xl shadow-black/30">
          <div className="max-h-72 overflow-y-auto py-1">
            {products.map((product) => {
              const isActive = activeProduct?.id === product.id;

              return (
                <button
                  key={product.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-text-primary transition-colors hover:bg-surface-muted"
                  onClick={() => {
                    setIsOpen(false);
                    if (!isActive) {
                      void setActiveProduct(product);
                    }
                  }}
                >
                  <span className="dashboard-product-switcher-option-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-xs font-bold text-accent-dark">
                    {getProductInitials(product.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  {isActive ? (
                    <Check aria-hidden className="h-4 w-4 text-accent" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm font-bold text-accent-dark transition-colors hover:bg-surface-muted"
            onClick={() => {
              setIsOpen(false);
              setIsCreateOpen(true);
            }}
          >
            <Plus aria-hidden className="h-4 w-4" />
            New product
          </button>
          {error ? (
            <p className="border-t border-border px-3 py-2 text-xs font-semibold text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
      {isCreateOpen ? (
        <ProductCreateDialog
          isSaving={isCreating}
          onClose={() => setIsCreateOpen(false)}
          onCreate={createProduct}
        />
      ) : null}
    </div>
  );
}
