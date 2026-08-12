"use client";

import { useSearchParams } from "next/navigation";
import { developmentFixtureStates } from "@/lib/clipstitchr/development/fixtures/developmentFixtureStates";
import type { DevelopmentFixtureState } from "@/lib/clipstitchr/development/types/DevelopmentFixtureState";

export function useDevelopmentFixtureState(): DevelopmentFixtureState {
  const searchParams = useSearchParams();
  const requestedState = searchParams.get("fixture");

  return developmentFixtureStates.includes(
    requestedState as DevelopmentFixtureState,
  )
    ? (requestedState as DevelopmentFixtureState)
    : "populated";
}
