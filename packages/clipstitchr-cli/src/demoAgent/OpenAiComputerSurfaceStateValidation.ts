export type OpenAiComputerSurfaceStateValidation =
  | { ok: true }
  | {
      errorMessage: string;
      ok: false;
      policyDecision: "blocked";
      stopReason: string;
    };
