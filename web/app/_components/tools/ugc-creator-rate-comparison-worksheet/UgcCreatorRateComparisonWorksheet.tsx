"use client";

import { useState } from "react";
import { UgcCreatorRateComparisonForm } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorRateComparisonForm";
import { UgcCreatorRateComparisonResults } from "@/app/_components/tools/ugc-creator-rate-comparison-worksheet/UgcCreatorRateComparisonResults";
import { calculateUgcCreatorRateComparison } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/calculateUgcCreatorRateComparison";
import { defaultUgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/defaultUgcCreatorRateComparisonInput";
import type { UgcCreatorRateComparisonInput } from "@/lib/clipstitchr/tools/ugcCreatorRateComparison/UgcCreatorRateComparisonInput";

export function UgcCreatorRateComparisonWorksheet() {
  const [input, setInput] = useState<UgcCreatorRateComparisonInput>(
    defaultUgcCreatorRateComparisonInput,
  );

  return (
    <section className="px-6 py-16" aria-label="UGC creator quote comparison">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <UgcCreatorRateComparisonForm value={input} onChange={setInput} />
        <UgcCreatorRateComparisonResults
          result={calculateUgcCreatorRateComparison(input)}
        />
      </div>
    </section>
  );
}
