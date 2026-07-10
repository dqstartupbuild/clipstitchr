export function getNextInteractiveTuiResultStartIndex(input: {
  currentIndex: number;
  direction: "down" | "end" | "home" | "page-down" | "page-up" | "up";
  lineCount: number;
  pageSize: number;
}) {
  const maximumStartIndex = Math.max(0, input.lineCount - input.pageSize);
  const nextIndex =
    input.direction === "home"
      ? 0
      : input.direction === "end"
        ? maximumStartIndex
        : input.direction === "page-down"
          ? input.currentIndex + input.pageSize
          : input.direction === "page-up"
            ? input.currentIndex - input.pageSize
            : input.direction === "down"
              ? input.currentIndex + 1
              : input.currentIndex - 1;

  return Math.min(maximumStartIndex, Math.max(0, nextIndex));
}
