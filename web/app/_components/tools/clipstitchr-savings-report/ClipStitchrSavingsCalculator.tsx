"use client";

import { useState } from "react";
import { ClipStitchrSavingsForm } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsForm";
import { ClipStitchrSavingsResults } from "@/app/_components/tools/clipstitchr-savings-report/ClipStitchrSavingsResults";
import { calculateClipStitchrSavings } from "@/lib/clipstitchr/tools/clipStitchrSavings/calculateClipStitchrSavings";
import type { ClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsInput";
import { defaultClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/defaultClipStitchrSavingsInput";

export function ClipStitchrSavingsCalculator() {
  const [input, setInput] = useState<ClipStitchrSavingsInput>(
    defaultClipStitchrSavingsInput,
  );

  return (
    <section
      className="px-6 py-16"
      aria-label="ClipStitchr savings scenario calculator"
    >
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <ClipStitchrSavingsForm value={input} onChange={setInput} />
        <ClipStitchrSavingsResults
          result={calculateClipStitchrSavings(input)}
        />
      </div>
    </section>
  );
}
