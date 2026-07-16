import { Button } from "@/app/_components/ui/Button";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ArchivedProductListProps = {
  isActionDisabled: boolean;
  products: ProductProfile[];
  restoringProductId: string | null;
  onRestore: (id: string) => Promise<void>;
};

export function ArchivedProductList({
  isActionDisabled,
  products,
  restoringProductId,
  onRestore,
}: ArchivedProductListProps) {
  if (!products.length) {
    return null;
  }

  return (
    <details className="mt-4 border-t border-border pt-4">
      <summary className="cursor-pointer text-sm font-bold text-text-primary">
        Archived products ({products.length})
      </summary>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Archived products keep their saved work. Restore one when your plan has
        room.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2"
          >
            <span className="text-sm font-semibold text-text-primary">
              {product.name}
            </span>
            <Button
              size="sm"
              variant="secondary"
              disabled={isActionDisabled}
              isLoading={restoringProductId === product.id}
              onClick={() => void onRestore(product.id)}
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </details>
  );
}
