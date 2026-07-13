import { UgcCreatorQuoteFields } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorQuoteFields";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { UgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonInput";

type UgcCreatorRateComparisonFormProps = {
  onChange: (value: UgcCreatorRateComparisonInput) => void;
  value: UgcCreatorRateComparisonInput;
};

export function UgcCreatorRateComparisonForm({
  onChange,
  value,
}: UgcCreatorRateComparisonFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Up to three quotes"
        title="Enter only terms you actually received"
        description="Zero-price slots are left out of the comparison."
      />
      <div className="mt-6 grid gap-5">
        {value.quotes.map((quote, index) => (
          <UgcCreatorQuoteFields
            index={index}
            key={index}
            value={quote}
            onChange={(nextQuote) =>
              onChange({
                quotes: value.quotes.map((currentQuote, quoteIndex) =>
                  quoteIndex === index ? nextQuote : currentQuote,
                ),
              })
            }
          />
        ))}
      </div>
    </Panel>
  );
}
