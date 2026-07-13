"use client";

import { useState } from "react";
import { AppAdHookRewriterEmptyState } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterEmptyState";
import { AppAdHookRewriterForm } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterForm";
import { AppAdHookRewriterResults } from "@/app/_components/tools/app-ad-hook-rewriter/AppAdHookRewriterResults";
import type { AppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterInput";
import type { AppAdHookRewriterResult } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriterResult";
import { defaultAppAdHookRewriterInput } from "@/lib/clipstitchr/tools/appAdHookRewriter/defaultAppAdHookRewriterInput";
import { rewriteAppAdHook } from "@/lib/clipstitchr/tools/appAdHookRewriter/rewriteAppAdHook";

export function AppAdHookRewriterClient() {
  const [input, setInput] = useState<AppAdHookRewriterInput>(
    defaultAppAdHookRewriterInput,
  );
  const [result, setResult] = useState<AppAdHookRewriterResult | null>(null);

  return (
    <section className="px-6 py-16 md:py-20" aria-label="App ad hook rewriter">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppAdHookRewriterForm
          value={input}
          onSubmit={() => setResult(rewriteAppAdHook(input))}
          onValueChange={(nextInput) => {
            setInput(nextInput);
            setResult(null);
          }}
        />
        {result ? (
          <AppAdHookRewriterResults result={result} />
        ) : (
          <AppAdHookRewriterEmptyState />
        )}
      </div>
    </section>
  );
}
