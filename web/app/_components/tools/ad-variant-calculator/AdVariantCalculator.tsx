"use client";

import { useState } from "react";
import { AdVariantCalculatorForm } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorForm";
import { AdVariantCalculatorResults } from "@/app/_components/tools/ad-variant-calculator/AdVariantCalculatorResults";
import type { AdVariantCalculatorInput } from "@/lib/clipstitchr/tools/adVariantCalculator/AdVariantCalculatorInput";
import { calculateAdVariantPlan } from "@/lib/clipstitchr/tools/adVariantCalculator/calculateAdVariantPlan";
import { defaultAdVariantCalculatorInput } from "@/lib/clipstitchr/tools/adVariantCalculator/defaultAdVariantCalculatorInput";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AdVariantCalculator({
  variant = "control",
}: {
  variant?: PublicToolGateVariant;
}) {
  const [input, setInput] = useState<AdVariantCalculatorInput>(
    defaultAdVariantCalculatorInput,
  );
  const result = calculateAdVariantPlan(input);

  return (
    <section className="px-6 py-16 md:py-20" aria-label="Ad variant calculator">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AdVariantCalculatorForm
          value={input}
          onReset={() => setInput(defaultAdVariantCalculatorInput)}
          onValueChange={(field, value) =>
            setInput((currentInput) => ({
              ...currentInput,
              [field]: value,
            }))
          }
        />
        <AdVariantCalculatorResults result={result} variant={variant} />
      </div>
    </section>
  );
}
