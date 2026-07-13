"use client";

import { useState } from "react";
import { AppAdBreakEvenForm } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenForm";
import { AppAdBreakEvenResults } from "@/app/_components/tools/app-ad-break-even-calculator/AppAdBreakEvenResults";
import type { AppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/AppAdBreakEvenInput";
import { calculateAppAdBreakEven } from "@/lib/clipstitchr/tools/appAdBreakEven/calculateAppAdBreakEven";
import { defaultAppAdBreakEvenInput } from "@/lib/clipstitchr/tools/appAdBreakEven/defaultAppAdBreakEvenInput";

export function AppAdBreakEvenCalculator() {
  const [input, setInput] = useState<AppAdBreakEvenInput>(
    defaultAppAdBreakEvenInput,
  );
  const result = calculateAppAdBreakEven(input);

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="App ad break-even calculator"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdBreakEvenForm value={input} onChange={setInput} />
        <AppAdBreakEvenResults result={result} />
      </div>
    </section>
  );
}
