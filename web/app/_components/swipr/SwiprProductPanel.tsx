import { Boxes } from "lucide-react";
import { SelectInput } from "@/app/_components/ui/SelectInput";
import { Panel } from "@/app/_components/ui/Panel";
import { SwiprSlideCountControl } from "@/app/_components/swipr/SwiprSlideCountControl";
import { SWIPR_CUSTOM_PRODUCT_ID } from "@/lib/clipstitchr/constants/swiprCustomProductId";

type SwiprProductOption = {
  value: string;
  label: string;
};

type SwiprProductPanelProps = {
  productOptions: SwiprProductOption[];
  selectedProductId: string;
  customProductContext: string;
  slideCount: number;
  onProductChange: (productId: string) => void;
  onCustomProductContextChange: (context: string) => void;
  onSlideCountChange: (count: number) => void;
};

export function SwiprProductPanel({
  productOptions,
  selectedProductId,
  customProductContext,
  slideCount,
  onProductChange,
  onCustomProductContextChange,
  onSlideCountChange,
}: SwiprProductPanelProps) {
  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-accent">
          <Boxes aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-accent-dark">Product</p>
          <h2 className="mt-0.5 text-base font-bold text-text-primary">
            Context
          </h2>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SelectInput
          label="Product"
          value={selectedProductId}
          options={productOptions}
          onChange={(event) => onProductChange(event.target.value)}
        />
        {selectedProductId === SWIPR_CUSTOM_PRODUCT_ID ? (
          <label className="block">
            <span className="text-sm font-semibold text-text-primary">
              Product name
            </span>
            <input
              value={customProductContext}
              maxLength={80}
              className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="Product or offer"
              onChange={(event) =>
                onCustomProductContextChange(event.target.value)
              }
            />
          </label>
        ) : null}
        <SwiprSlideCountControl
          value={slideCount}
          onChange={onSlideCountChange}
        />
      </div>
    </Panel>
  );
}
