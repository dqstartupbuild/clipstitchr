import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { AppAdCreativeFatigueInput } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/AppAdCreativeFatigueInput";
import { appAdCreativeFatigueInputLimits } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/appAdCreativeFatigueInputLimits";

type AppAdCreativeFatigueFormProps = {
  onChange: (value: AppAdCreativeFatigueInput) => void;
  value: AppAdCreativeFatigueInput;
};

export function AppAdCreativeFatigueForm({
  onChange,
  value,
}: AppAdCreativeFatigueFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Your delivery assumptions"
        title="Model exposure, not performance"
        description="Use audience and impression numbers from your own plan or reports."
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <ToolNumberField
          id="fatigue-audience"
          label="Reachable audience"
          description="The audience size you want to model."
          max={appAdCreativeFatigueInputLimits.audienceSize}
          value={value.audienceSize}
          onChange={(audienceSize) => onChange({ ...value, audienceSize })}
        />
        <ToolNumberField
          id="fatigue-impressions"
          label="Daily impressions"
          description="Your own planned or observed daily delivery."
          max={appAdCreativeFatigueInputLimits.dailyImpressions}
          value={value.dailyImpressions}
          onChange={(dailyImpressions) =>
            onChange({ ...value, dailyImpressions })
          }
        />
        <ToolNumberField
          id="fatigue-creatives"
          label="Active creatives"
          description="Creatives sharing delivery in this simple model."
          max={appAdCreativeFatigueInputLimits.creativeCount}
          value={value.activeCreativeCount}
          onChange={(activeCreativeCount) =>
            onChange({ ...value, activeCreativeCount })
          }
        />
        <ToolNumberField
          id="fatigue-window"
          label="Planning window"
          description="How many days you want to inspect."
          max={appAdCreativeFatigueInputLimits.windowDays}
          suffix="days"
          value={value.windowDays}
          onChange={(windowDays) => onChange({ ...value, windowDays })}
        />
        <div className="sm:col-span-2">
          <ToolNumberField
            id="fatigue-ceiling"
            label="Your frequency ceiling"
            description="A threshold chosen from your own evidence, not a benchmark from this tool."
            max={appAdCreativeFatigueInputLimits.frequencyCeiling}
            step={0.1}
            suffix="x"
            value={value.frequencyCeiling}
            onChange={(frequencyCeiling) =>
              onChange({ ...value, frequencyCeiling })
            }
          />
        </div>
      </div>
    </Panel>
  );
}
