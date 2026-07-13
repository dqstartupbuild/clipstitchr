"use client";

import { useState } from "react";
import { AppAdCreativeFatigueForm } from "@/app/_components/tools/app-ad-creative-fatigue-calculator/AppAdCreativeFatigueForm";
import { AppAdCreativeFatigueResults } from "@/app/_components/tools/app-ad-creative-fatigue-calculator/AppAdCreativeFatigueResults";
import type { AppAdCreativeFatigueInput } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/AppAdCreativeFatigueInput";
import { calculateAppAdCreativeFatigue } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/calculateAppAdCreativeFatigue";
import { defaultAppAdCreativeFatigueInput } from "@/lib/clipstitchr/tools/appAdCreativeFatigue/defaultAppAdCreativeFatigueInput";

export function AppAdCreativeFatigueCalculator() {
  const [input, setInput] = useState<AppAdCreativeFatigueInput>(
    defaultAppAdCreativeFatigueInput,
  );

  return (
    <section className="px-6 py-16" aria-label="Creative exposure calculator">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdCreativeFatigueForm value={input} onChange={setInput} />
        <AppAdCreativeFatigueResults
          result={calculateAppAdCreativeFatigue(input)}
        />
      </div>
    </section>
  );
}
