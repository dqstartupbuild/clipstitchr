import { Panel } from "@/app/_components/ui/Panel";
import { ProductSocialAccountSelector } from "./ProductSocialAccountSelector";
import { ProductSocialQueueEditor } from "./ProductSocialQueueEditor";

type SettingsSocialProductPanelProps = {
  productId?: string;
  productName?: string;
};

export function SettingsSocialProductPanel({
  productId,
  productName,
}: SettingsSocialProductPanelProps) {
  if (!productId || !productName) {
    return null;
  }

  return (
    <Panel className="p-4">
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-semibold text-accent-dark">
            Social publishing
          </p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">
            Where and when {productName} posts
          </h2>
        </div>
        <ProductSocialAccountSelector
          productId={productId}
          productName={productName}
        />
        <ProductSocialQueueEditor productId={productId} />
      </div>
    </Panel>
  );
}
