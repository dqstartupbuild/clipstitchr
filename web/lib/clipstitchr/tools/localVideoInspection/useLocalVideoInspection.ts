"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/readLocalVideoInspection";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

export function useLocalVideoInspection() {
  const controllerRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<LocalVideoInspection | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const inspectFile = useCallback(async (nextFile: File) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setFile(nextFile);
    setInspection(null);
    setErrorMessage(null);
    setIsInspecting(true);

    try {
      const nextInspection = await readLocalVideoInspection(
        nextFile,
        controller.signal,
      );

      if (!controller.signal.aborted && controllerRef.current === controller) {
        setInspection(nextInspection);
      }
    } catch (error) {
      if (!controller.signal.aborted && controllerRef.current === controller) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "This video could not be checked.",
        );
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setIsInspecting(false);
      }
    }
  }, []);

  return {
    errorMessage,
    file,
    inspection,
    inspectFile,
    isInspecting,
  };
}
