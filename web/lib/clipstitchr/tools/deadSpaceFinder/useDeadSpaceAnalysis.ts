"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysis";
import type { DeadSpaceAnalysisOptions } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysisOptions";
import { readDeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/readDeadSpaceAnalysis";

export function useDeadSpaceAnalysis() {
  const controllerRef = useRef<AbortController | null>(null);
  const [analysis, setAnalysis] = useState<DeadSpaceAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const analyzeFile = useCallback(
    async (nextFile: File, options: DeadSpaceAnalysisOptions) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setAnalysis(null);
      setErrorMessage(null);
      setFile(nextFile);
      setIsAnalyzing(true);

      try {
        const nextAnalysis = await readDeadSpaceAnalysis(
          nextFile,
          options,
          controller.signal,
        );
        if (
          !controller.signal.aborted &&
          controllerRef.current === controller
        ) {
          setAnalysis(nextAnalysis);
        }
      } catch (error) {
        if (
          !controller.signal.aborted &&
          controllerRef.current === controller
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "This video could not be analyzed.",
          );
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setIsAnalyzing(false);
        }
      }
    },
    [],
  );

  return { analysis, analyzeFile, errorMessage, file, isAnalyzing };
}
