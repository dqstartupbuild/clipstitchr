"use client";

import { useState } from "react";
import { AppAdHookGraderEmptyState } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderEmptyState";
import { AppAdHookGraderForm } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderForm";
import { AppAdHookGraderResults } from "@/app/_components/tools/app-ad-hook-grader/AppAdHookGraderResults";
import type { AppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderInput";
import type { AppAdHookGraderResult } from "@/lib/clipstitchr/tools/appAdHookGrader/AppAdHookGraderResult";
import { defaultAppAdHookGraderInput } from "@/lib/clipstitchr/tools/appAdHookGrader/defaultAppAdHookGraderInput";
import { gradeAppAdHook } from "@/lib/clipstitchr/tools/appAdHookGrader/gradeAppAdHook";

export function AppAdHookGraderClient() {
  const [input, setInput] = useState<AppAdHookGraderInput>(
    defaultAppAdHookGraderInput,
  );
  const [result, setResult] = useState<AppAdHookGraderResult | null>(null);

  return (
    <section className="px-6 py-16 md:py-20" aria-label="App ad hook grader">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdHookGraderForm
          value={input}
          onSubmit={() => setResult(gradeAppAdHook(input))}
          onValueChange={(nextInput) => {
            setInput(nextInput);
            setResult(null);
          }}
        />
        {result ? (
          <AppAdHookGraderResults result={result} />
        ) : (
          <AppAdHookGraderEmptyState />
        )}
      </div>
    </section>
  );
}
