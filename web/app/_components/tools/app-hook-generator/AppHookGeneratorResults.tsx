import { RefreshCw } from "lucide-react";
import { AppHookGeneratorPricingCta } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorPricingCta";
import { AppHookGeneratorResultCard } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorResultCard";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import type { AppHookGeneratorResult } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorResult";

type AppHookGeneratorResultsProps = {
  isLoading: boolean;
  result: AppHookGeneratorResult;
  onRegenerate: () => void;
};

export function AppHookGeneratorResults({
  isLoading,
  result,
  onRegenerate,
}: AppHookGeneratorResultsProps) {
  return (
    <Panel className="p-5 md:p-6" aria-live="polite">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="marketing-eyebrow">Your hook set</p>
          <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
            Pick the line that makes the demo easier to watch.
          </h2>
        </div>
        <Button
          className="shrink-0"
          icon={<RefreshCw aria-hidden className="h-4 w-4" />}
          isLoading={isLoading}
          type="button"
          variant="secondary"
          onClick={onRegenerate}
        >
          Another set
        </Button>
      </div>
      <div className="mt-6 grid gap-4">
        {result.hooks.map((hook, index) => (
          <AppHookGeneratorResultCard
            hook={hook}
            index={index}
            key={`${index}-${hook.text}`}
          />
        ))}
      </div>
      <AppHookGeneratorPricingCta />
    </Panel>
  );
}
