export function getInteractiveTuiMaximumVisibleChoices(rows?: number) {
  const terminalRows = rows && rows > 0 ? rows : 24;

  return Math.max(1, Math.min(9, terminalRows - 10));
}
