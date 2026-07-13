"use client";

import { AppHookGeneratorEmptyState } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorEmptyState";
import { AppHookGeneratorForm } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorForm";
import { AppHookGeneratorResults } from "@/app/_components/tools/app-hook-generator/AppHookGeneratorResults";
import { useAppHookGenerator } from "@/lib/clipstitchr/tools/appHookGenerator/useAppHookGenerator";

export function AppHookGeneratorClient() {
  const {
    error,
    input,
    isLoading,
    regenerate,
    result,
    submit,
    updateInput,
  } = useAppHookGenerator();

  return (
    <section className="px-6 py-16 md:py-20" aria-label="App hook generator">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <AppHookGeneratorForm
          error={error}
          isLoading={isLoading}
          value={input}
          onSubmit={submit}
          onValueChange={updateInput}
        />
        {result ? (
          <AppHookGeneratorResults
            isLoading={isLoading}
            result={result}
            onRegenerate={regenerate}
          />
        ) : (
          <AppHookGeneratorEmptyState />
        )}
      </div>
    </section>
  );
}
