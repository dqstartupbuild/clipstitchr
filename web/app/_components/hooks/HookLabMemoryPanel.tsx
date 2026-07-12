import { HookLabMemoryForm } from "@/app/_components/hooks/HookLabMemoryForm";
import { Panel } from "@/app/_components/ui/Panel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type HookLabMemoryPanelProps = {
  isSaving: boolean;
  product?: ProductProfile;
  onUpdate: (id: string, input: ProductProfileCreateInput) => Promise<unknown>;
};

export function HookLabMemoryPanel({
  isSaving,
  product,
  onUpdate,
}: HookLabMemoryPanelProps) {
  return (
    <Panel className="p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Hook Lab</p>
        <h2 className="mt-1 text-lg font-bold text-text-primary">
          Writing preferences
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Pick a goal and tone, then block phrases that never sound like you.
        </p>
      </div>
      {product ? (
        <HookLabMemoryForm
          key={product.id}
          isSaving={isSaving}
          product={product}
          onUpdate={onUpdate}
        />
      ) : (
        <p className="text-sm leading-6 text-text-secondary">
          Choose an active product before saving writing preferences.
        </p>
      )}
    </Panel>
  );
}
