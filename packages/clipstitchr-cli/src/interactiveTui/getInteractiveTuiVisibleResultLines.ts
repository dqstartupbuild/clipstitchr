export function getInteractiveTuiVisibleResultLines(input: {
  lines: string[];
  pageSize: number;
  startIndex: number;
}) {
  const pageSize = Math.max(1, input.pageSize);
  const maximumStartIndex = Math.max(0, input.lines.length - pageSize);
  const startIndex = Math.min(
    maximumStartIndex,
    Math.max(0, input.startIndex),
  );
  const lines = input.lines.slice(startIndex, startIndex + pageSize);

  return {
    hasMoreAbove: startIndex > 0,
    hasMoreBelow: startIndex + lines.length < input.lines.length,
    lines,
    startIndex,
  };
}
