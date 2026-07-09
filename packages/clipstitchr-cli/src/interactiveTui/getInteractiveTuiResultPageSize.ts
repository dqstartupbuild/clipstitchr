export function getInteractiveTuiResultPageSize(rows?: number) {
  const terminalRows = rows && rows > 0 ? rows : 24;

  return Math.max(1, Math.min(10, terminalRows - 13));
}
