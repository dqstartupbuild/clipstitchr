import { ToolNumberField } from "@/app/_components/tools/ToolNumberField";
import { ToolTextField } from "@/app/_components/tools/ToolTextField";
import type { UgcCreatorQuoteInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorQuoteInput";
import { ugcCreatorRateComparisonInputLimits } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/ugcCreatorRateComparisonInputLimits";

type UgcCreatorQuoteFieldsProps = {
  index: number;
  onChange: (value: UgcCreatorQuoteInput) => void;
  value: UgcCreatorQuoteInput;
};

export function UgcCreatorQuoteFields({
  index,
  onChange,
  value,
}: UgcCreatorQuoteFieldsProps) {
  const idPrefix = `creator-quote-${index}`;

  return (
    <fieldset className="rounded-lg border border-border bg-surface-muted/30 p-4">
      <legend className="px-2 text-sm font-bold text-text-primary">
        Quote {index + 1}
      </legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ToolTextField
            id={`${idPrefix}-label`}
            label="Creator or quote label"
            maxLength={ugcCreatorRateComparisonInputLimits.labelLength}
            required={false}
            value={value.label}
            onChange={(label) => onChange({ ...value, label })}
          />
        </div>
        <ToolNumberField
          id={`${idPrefix}-price`}
          label="Quoted price"
          description="The base amount in this quote."
          max={ugcCreatorRateComparisonInputLimits.money}
          step={0.01}
          suffix="USD"
          value={value.quotedPrice}
          onChange={(quotedPrice) => onChange({ ...value, quotedPrice })}
        />
        <ToolNumberField
          id={`${idPrefix}-addons`}
          label="Required add-ons"
          description="Usage, raw footage, rush, or other entered add-ons."
          max={ugcCreatorRateComparisonInputLimits.money}
          step={0.01}
          suffix="USD"
          value={value.addOnCost}
          onChange={(addOnCost) => onChange({ ...value, addOnCost })}
        />
        <ToolNumberField
          id={`${idPrefix}-deliverables`}
          label="Finished deliverables"
          description="Completed videos included in this quote."
          max={ugcCreatorRateComparisonInputLimits.count}
          value={value.deliverableCount}
          onChange={(deliverableCount) =>
            onChange({ ...value, deliverableCount })
          }
        />
        <ToolNumberField
          id={`${idPrefix}-clips`}
          label="Expected usable clips"
          description="Your estimate of separate source clips you can reuse."
          max={ugcCreatorRateComparisonInputLimits.count}
          value={value.usableClipCount}
          onChange={(usableClipCount) =>
            onChange({ ...value, usableClipCount })
          }
        />
        <ToolNumberField
          id={`${idPrefix}-revisions`}
          label="Included revisions"
          description="Revision rounds stated in the quote."
          max={ugcCreatorRateComparisonInputLimits.count}
          value={value.includedRevisionCount}
          onChange={(includedRevisionCount) =>
            onChange({ ...value, includedRevisionCount })
          }
        />
        <ToolNumberField
          id={`${idPrefix}-usage`}
          label="Entered usage term"
          description="Months stated in the quote. Zero can mean not entered."
          max={ugcCreatorRateComparisonInputLimits.usageMonths}
          suffix="months"
          value={value.usageMonths}
          onChange={(usageMonths) => onChange({ ...value, usageMonths })}
        />
      </div>
      <label className="mt-4 flex items-start gap-3 text-sm font-semibold text-text-primary">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border text-accent"
          checked={value.rawFootageIncluded}
          onChange={(event) =>
            onChange({
              ...value,
              rawFootageIncluded: event.currentTarget.checked,
            })
          }
        />
        Raw footage is listed as included
      </label>
    </fieldset>
  );
}
