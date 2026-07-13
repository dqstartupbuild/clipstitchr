import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import type { ClientContentCapacityStageInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityStageInput";
import { clientContentCapacityInputLimits } from "@/lib/clipstitchr/tools/clientContentCapacity/clientContentCapacityInputLimits";

type ClientContentCapacityStageFieldsProps = {
  idPrefix: string;
  label: string;
  onChange: (value: ClientContentCapacityStageInput) => void;
  value: ClientContentCapacityStageInput;
};

export function ClientContentCapacityStageFields({
  idPrefix,
  label,
  onChange,
  value,
}: ClientContentCapacityStageFieldsProps) {
  return (
    <fieldset className="rounded-lg border border-border bg-surface-muted/30 p-4">
      <legend className="px-2 text-sm font-bold text-text-primary">
        {label}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <ToolNumberField
          id={`${idPrefix}-available-hours`}
          label="Available hours per week"
          description="Team hours available for this stage before the productive-time adjustment."
          max={clientContentCapacityInputLimits.hours}
          step={0.1}
          suffix="hours"
          value={value.availableHoursPerWeek}
          onChange={(availableHoursPerWeek) =>
            onChange({ ...value, availableHoursPerWeek })
          }
        />
        <ToolNumberField
          id={`${idPrefix}-hours-per-deliverable`}
          label="Hours per deliverable"
          description="Average effort for one finished deliverable at this stage."
          max={clientContentCapacityInputLimits.hours}
          min={0.1}
          step={0.1}
          suffix="hours"
          value={value.hoursPerDeliverable}
          onChange={(hoursPerDeliverable) =>
            onChange({ ...value, hoursPerDeliverable })
          }
        />
      </div>
    </fieldset>
  );
}
