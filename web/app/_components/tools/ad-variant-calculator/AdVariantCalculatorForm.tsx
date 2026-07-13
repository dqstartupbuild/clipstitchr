import { RotateCcw } from "lucide-react";
import { AdVariantNumberField } from "@/app/_components/tools/ad-variant-calculator/AdVariantNumberField";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AdVariantCalculatorInput } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorInput";

type AdVariantCalculatorFormProps = {
  value: AdVariantCalculatorInput;
  onReset: () => void;
  onValueChange: (
    field: keyof AdVariantCalculatorInput,
    value: number,
  ) => void;
};

export function AdVariantCalculatorForm({
  value,
  onReset,
  onValueChange,
}: AdVariantCalculatorFormProps) {
  return (
    <Panel className="h-fit p-5 md:p-6">
      <PanelHeader
        eyebrow="Your raw material"
        title="What do you have to work with?"
        description="Change any number. Your plan updates right away."
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon={<RotateCcw aria-hidden className="h-4 w-4" />}
            onClick={onReset}
          >
            Reset example
          </Button>
        }
      />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <AdVariantNumberField
          id="ad-variant-ugc-clips"
          label="UGC clips"
          description="Founder, creator, testimonial, or reaction clips that can open an ad."
          value={value.ugcClipCount}
          onChange={(nextValue) => onValueChange("ugcClipCount", nextValue)}
        />
        <AdVariantNumberField
          id="ad-variant-demo-clips"
          label="Product demos"
          description="Different screen recordings or product moments that can follow the opening."
          value={value.demoClipCount}
          onChange={(nextValue) => onValueChange("demoClipCount", nextValue)}
        />
        <AdVariantNumberField
          id="ad-variant-hooks"
          label="Hooks"
          description="Opening lines or text overlays you want to compare."
          value={value.hookCount}
          onChange={(nextValue) => onValueChange("hookCount", nextValue)}
        />
        <AdVariantNumberField
          id="ad-variant-calls-to-action"
          label="Calls to action"
          description="Different next steps, such as download, try it, or learn more."
          value={value.callToActionCount}
          onChange={(nextValue) =>
            onValueChange("callToActionCount", nextValue)
          }
        />
      </div>
    </Panel>
  );
}
