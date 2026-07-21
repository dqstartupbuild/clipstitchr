"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchHookLibraryTemplates } from "@/lib/clipstitchr/client/fetchHookLibraryTemplates";
import type { HookLibraryQuery } from "@/lib/clipstitchr/types/HookLibraryQuery";
import type { HookLibraryResponse } from "@/lib/clipstitchr/types/HookLibraryResponse";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type HookLibraryRequestState = {
  data: HookLibraryResponse | null;
  error: string | null;
  requestKey: string;
};

export function useHookLibraryTemplates({
  category,
  page,
  purpose,
  query,
  risk,
  trigger,
}: HookLibraryQuery) {
  const [state, setState] = useState<HookLibraryRequestState>({
    data: null,
    error: null,
    requestKey: "",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = JSON.stringify([
    category,
    page,
    purpose,
    query,
    risk,
    trigger,
    reloadKey,
  ]);

  useEffect(() => {
    const controller = new AbortController();

    void fetchHookLibraryTemplates(
      { category, page, purpose, query, risk, trigger },
      controller.signal,
    )
      .then((data) => setState({ data, error: null, requestKey }))
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setState((currentState) => ({
            data: currentState.data,
            error: getErrorMessage(
              requestError,
              "Unable to load the hook library.",
            ),
            requestKey,
          }));
        }
      });

    return () => controller.abort();
  }, [category, page, purpose, query, requestKey, risk, trigger]);

  const refetch = useCallback(() => setReloadKey((value) => value + 1), []);

  return {
    data: state.data,
    error: state.requestKey === requestKey ? state.error : null,
    isLoading: state.requestKey !== requestKey,
    refetch,
  };
}
