"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { developmentFixtureStates } from "@/lib/clipstitchr/development/fixtures/developmentFixtureStates";
import type { DevelopmentFixtureState } from "@/lib/clipstitchr/development/types/DevelopmentFixtureState";

const fixtureStateLabels: Record<DevelopmentFixtureState, string> = {
  empty: "Empty",
  error: "Error",
  loading: "Loading",
  populated: "Sample data",
};

type DevelopmentFixtureStateSelectorProps = {
  value: DevelopmentFixtureState;
};

export function DevelopmentFixtureStateSelector({
  value,
}: DevelopmentFixtureStateSelectorProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Fixture state"
    >
      <span className="mr-1 text-sm font-semibold text-text-secondary">
        Preview state
      </span>
      {developmentFixtureStates.map((state) => (
        <button
          key={state}
          type="button"
          aria-pressed={state === value}
          className={[
            "min-h-9 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            state === value
              ? "bg-surface-elevated text-accent-dark"
              : "bg-surface-muted text-text-secondary hover:bg-surface-elevated hover:text-text-primary",
          ].join(" ")}
          onClick={() => {
            const nextSearchParams = new URLSearchParams(searchParams.toString());

            nextSearchParams.set("fixture", state);
            router.replace(`${pathname}?${nextSearchParams.toString()}`, {
              scroll: false,
            });
          }}
        >
          {fixtureStateLabels[state]}
        </button>
      ))}
    </div>
  );
}
