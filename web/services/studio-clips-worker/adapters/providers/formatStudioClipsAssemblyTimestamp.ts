export function formatStudioClipsAssemblyTimestamp(milliseconds: number): string {
  const total = Math.max(0, milliseconds) / 1_000;
  const hours = Math.floor(total / 3_600);
  const minutes = Math.floor((total % 3_600) / 60);
  const seconds = (total % 60).toFixed(3).padStart(6, "0");
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${seconds}`;
}
