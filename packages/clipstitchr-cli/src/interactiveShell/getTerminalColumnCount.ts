export function getTerminalColumnCount(columns = process.stdout.columns) {
  return columns && columns > 0 ? columns : 80;
}
