import { SettingsHookLabForm } from "@/app/_components/settings/SettingsHookLabForm";
import { Panel } from "@/app/_components/ui/Panel";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";

type SettingsHookLabPanelProps = {
  isSaving: boolean;
  product?: ProductProfile;
  onUpdate: (id: string, input: ProductProfileCreateInput) => Promise<unknown>;
};

export function SettingsHookLabPanel({
  isSaving,
  product,
  onUpdate,
}: SettingsHookLabPanelProps) {
  return (
    <Panel className="p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-accent-dark">Hook Lab</p>
        <h2 className="mt-1 text-lg font-bold text-text-primary">
          Active product memory
        </h2>
        <p className="mt-1 text-sm leading-6 text-text-secondary">
          Keep the hooks you like close and block the ones that feel wrong.
        </p>
      </div>
      {product ? (
        <SettingsHookLabForm
          key={product.id}
          isSaving={isSaving}
          product={product}
          onUpdate={onUpdate}
        />
      ) : (
        <p className="text-sm leading-6 text-text-secondary">
          Choose an active product before saving hook examples.
        </p>
      )}
    </Panel>
  );
}
