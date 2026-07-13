"use client";

import { useState } from "react";
import { AppAdTestPlanForm } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanForm";
import { AppAdTestPlanResults } from "@/app/_components/tools/app-ad-test-plan-generator/AppAdTestPlanResults";
import type { AppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanInput";
import { createAppAdTestPlan } from "@/lib/clipstitchr/tools/appAdTestPlan/createAppAdTestPlan";
import { defaultAppAdTestPlanInput } from "@/lib/clipstitchr/tools/appAdTestPlan/defaultAppAdTestPlanInput";

export function AppAdTestPlanGenerator() {
  const [input, setInput] = useState<AppAdTestPlanInput>(
    defaultAppAdTestPlanInput,
  );
  const result = createAppAdTestPlan(input);

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="App ad creative test plan generator"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdTestPlanForm value={input} onChange={setInput} />
        <AppAdTestPlanResults result={result} />
      </div>
    </section>
  );
}
