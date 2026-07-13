"use client";

import { useState } from "react";
import { AppAdCostPerCreativeForm } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeForm";
import { AppAdCostPerCreativeResults } from "@/app/_components/tools/app-ad-cost-per-creative-calculator/AppAdCostPerCreativeResults";
import type { AppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/AppAdCostPerCreativeInput";
import { calculateAppAdCostPerCreative } from "@/lib/clipstitchr/tools/appAdCostPerCreative/calculateAppAdCostPerCreative";
import { defaultAppAdCostPerCreativeInput } from "@/lib/clipstitchr/tools/appAdCostPerCreative/defaultAppAdCostPerCreativeInput";

export function AppAdCostPerCreativeCalculator() {
  const [input, setInput] = useState<AppAdCostPerCreativeInput>(
    defaultAppAdCostPerCreativeInput,
  );
  const result = calculateAppAdCostPerCreative(input);

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="App ad cost per creative calculator"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdCostPerCreativeForm value={input} onChange={setInput} />
        <AppAdCostPerCreativeResults result={result} />
      </div>
    </section>
  );
}
