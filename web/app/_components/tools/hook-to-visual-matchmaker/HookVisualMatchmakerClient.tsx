"use client";

import { useState } from "react";
import { HookVisualMatchmakerEmptyState } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerEmptyState";
import { HookVisualMatchmakerForm } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerForm";
import { HookVisualMatchmakerResults } from "@/app/_components/tools/hook-to-visual-matchmaker/HookVisualMatchmakerResults";
import type { HookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchmakerInput";
import type { HookVisualMatchResult } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualMatchResult";
import { defaultHookVisualMatchmakerInput } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/defaultHookVisualMatchmakerInput";
import { matchHookToVisual } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/matchHookToVisual";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type HookVisualMatchmakerClientProps = {
  variant?: PublicToolGateVariant;
};

export function HookVisualMatchmakerClient({
  variant = "control",
}: HookVisualMatchmakerClientProps) {
  const [input, setInput] = useState<HookVisualMatchmakerInput>(
    defaultHookVisualMatchmakerInput,
  );
  const [result, setResult] = useState<HookVisualMatchResult | null>(null);

  return (
    <section className="px-6 py-16 md:py-20" aria-label="Hook to visual matchmaker">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <HookVisualMatchmakerForm
          value={input}
          onSubmit={() => setResult(matchHookToVisual(input))}
          onValueChange={(nextInput) => {
            setInput(nextInput);
            setResult(null);
          }}
        />
        {result ? (
          <HookVisualMatchmakerResults result={result} variant={variant} />
        ) : (
          <HookVisualMatchmakerEmptyState />
        )}
      </div>
    </section>
  );
}
