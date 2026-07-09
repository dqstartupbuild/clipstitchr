import { useInput } from "ink";
import { useEffect, useState } from "react";

export function useInteractiveTuiResultOutputNavigation(input: {
  isActive: boolean;
  lines: string[];
  pageSize: number;
}) {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    setStartIndex(0);
  }, [input.lines]);

  useInput(
    (_typedInput, key) => {
      if (!key.pageDown && !key.pageUp) {
        return;
      }

      setStartIndex((currentIndex) => {
        const maximumStartIndex = Math.max(
          0,
          input.lines.length - input.pageSize,
        );
        const nextIndex = key.pageDown
          ? currentIndex + input.pageSize
          : currentIndex - input.pageSize;

        return Math.min(maximumStartIndex, Math.max(0, nextIndex));
      });
    },
    { isActive: input.isActive },
  );

  return startIndex;
}
