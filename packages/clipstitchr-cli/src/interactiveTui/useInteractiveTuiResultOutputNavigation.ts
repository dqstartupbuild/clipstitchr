import { useInput } from "ink";
import { useEffect, useState } from "react";
import { getNextInteractiveTuiResultStartIndex } from "./getNextInteractiveTuiResultStartIndex.js";
import { useStableInteractiveTuiInputHandler } from "./useStableInteractiveTuiInputHandler.js";

export function useInteractiveTuiResultOutputNavigation(input: {
  isActive: boolean;
  lines: string[];
  pageSize: number;
}) {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    setStartIndex(0);
  }, [input.lines]);

  const handleInput = useStableInteractiveTuiInputHandler(
    (typedInput, key) => {
      const direction =
        key.downArrow || typedInput === "j"
          ? "down"
          : key.upArrow || typedInput === "k"
            ? "up"
            : key.pageDown
              ? "page-down"
              : key.pageUp
                ? "page-up"
                : key.home
                  ? "home"
                  : key.end
                    ? "end"
                    : undefined;

      if (!direction) {
        return;
      }

      setStartIndex((currentIndex) =>
        getNextInteractiveTuiResultStartIndex({
          currentIndex,
          direction,
          lineCount: input.lines.length,
          pageSize: input.pageSize,
        }),
      );
    },
  );
  useInput(handleInput, { isActive: input.isActive });

  return startIndex;
}
