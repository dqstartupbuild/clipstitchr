import type { Key } from "ink";
import { useCallback, useLayoutEffect, useRef } from "react";

export function useStableInteractiveTuiInputHandler(
  handler: (input: string, key: Key) => void,
) {
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((input: string, key: Key) => {
    handlerRef.current(input, key);
  }, []);
}
