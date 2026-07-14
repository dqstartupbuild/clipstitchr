"use client";

import { useState } from "react";
import { AppUgcCostCalculatorForm } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorForm";
import { AppUgcCostCalculatorResults } from "@/app/_components/tools/app-ugc-cost-calculator/AppUgcCostCalculatorResults";
import type { AppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/AppUgcCostInput";
import { calculateAppUgcCost } from "@/lib/clipstitchr/tools/appUgcCostCalculator/calculateAppUgcCost";
import { defaultAppUgcCostInput } from "@/lib/clipstitchr/tools/appUgcCostCalculator/defaultAppUgcCostInput";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

export function AppUgcCostCalculator({
  variant = "control",
}: {
  variant?: PublicToolGateVariant;
}) {
  const [input, setInput] = useState<AppUgcCostInput>(defaultAppUgcCostInput);
  const result = calculateAppUgcCost(input);

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="App UGC production cost calculator"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppUgcCostCalculatorForm value={input} onChange={setInput} />
        <AppUgcCostCalculatorResults result={result} variant={variant} />
      </div>
    </section>
  );
}
