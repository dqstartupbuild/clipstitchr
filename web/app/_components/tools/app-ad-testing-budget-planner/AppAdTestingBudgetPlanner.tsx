"use client";

import { useState } from "react";
import { AppAdTestingBudgetForm } from "@/app/_components/tools/app-ad-testing-budget-planner/AppAdTestingBudgetForm";
import { AppAdTestingBudgetResults } from "@/app/_components/tools/app-ad-testing-budget-planner/AppAdTestingBudgetResults";
import type { AppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/AppAdTestingBudgetInput";
import { calculateAppAdTestingBudget } from "@/lib/clipstitchr/tools/appAdTestingBudget/calculateAppAdTestingBudget";
import { defaultAppAdTestingBudgetInput } from "@/lib/clipstitchr/tools/appAdTestingBudget/defaultAppAdTestingBudgetInput";

export function AppAdTestingBudgetPlanner() {
  const [input, setInput] = useState<AppAdTestingBudgetInput>(
    defaultAppAdTestingBudgetInput,
  );

  return (
    <section
      className="px-6 py-16"
      aria-label="Creative testing budget planner"
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdTestingBudgetForm value={input} onChange={setInput} />
        <AppAdTestingBudgetResults
          result={calculateAppAdTestingBudget(input)}
        />
      </div>
    </section>
  );
}
