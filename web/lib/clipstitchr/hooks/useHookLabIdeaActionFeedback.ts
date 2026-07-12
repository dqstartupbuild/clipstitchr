"use client";

import { useState } from "react";

export function useHookLabIdeaActionFeedback() {
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  return {
    error,
    setError,
    setStatusMessage,
    statusMessage,
  };
}
