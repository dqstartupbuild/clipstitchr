"use client";

import { useEffect, useRef, useState } from "react";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import type { AppHookGeneratorInput } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorInput";
import type { AppHookGeneratorResult } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorResult";
import { defaultAppHookGeneratorInput } from "@/lib/clipstitchr/tools/appHookGenerator/defaultAppHookGeneratorInput";
import { generateAppHooks } from "@/lib/clipstitchr/tools/appHookGenerator/generateAppHooks";

export function useAppHookGenerator() {
  const [input, setInput] = useState<AppHookGeneratorInput>(
    defaultAppHookGeneratorInput,
  );
  const [result, setResult] = useState<AppHookGeneratorResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
    },
    [],
  );

  async function requestHooks(variationIndex: number) {
    requestControllerRef.current?.abort();
    const requestController = new AbortController();
    requestControllerRef.current = requestController;
    setError("");
    setIsLoading(true);
    const requestKind = variationIndex === 0 ? "initial" : "another_set";
    const requestInput = { ...input, variationIndex };

    trackPostHogEvent("app_hook_generator_submitted", {
      edge_level: input.edgeLevel,
      request_kind: requestKind,
    });

    try {
      const nextResult = await generateAppHooks(
        requestInput,
        requestController.signal,
      );

      if (requestController.signal.aborted) {
        return;
      }

      setResult(nextResult);
      setInput((currentInput) => ({ ...currentInput, variationIndex }));
      trackPostHogEvent("app_hook_generator_completed", {
        edge_level: input.edgeLevel,
        request_kind: requestKind,
        result_count: nextResult.hooks.length,
      });
    } catch (requestError) {
      if (requestController.signal.aborted) {
        return;
      }

      const isRateLimited =
        requestError instanceof Error &&
        requestError.message.includes("bunch of hook sets");

      setError(
        requestError instanceof Error
          ? requestError.message
          : "The hook generator is having trouble right now. Try again soon.",
      );
      trackPostHogEvent("app_hook_generator_failed", {
        error_category: isRateLimited ? "rate_limited" : "request_failed",
        request_kind: requestKind,
      });
    } finally {
      if (requestControllerRef.current === requestController) {
        requestControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }

  function updateInput(nextInput: AppHookGeneratorInput) {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setIsLoading(false);
    setInput({ ...nextInput, variationIndex: 0 });
    setResult(null);
    setError("");
  }

  function regenerate() {
    const currentVariation = result?.variationIndex ?? 0;
    void requestHooks((currentVariation + 1) % 101);
  }

  return {
    error,
    input,
    isLoading,
    result,
    regenerate,
    submit: () => requestHooks(input.variationIndex ?? 0),
    updateInput,
  };
}
