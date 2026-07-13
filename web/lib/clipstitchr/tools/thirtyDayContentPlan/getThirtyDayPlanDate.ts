export function getThirtyDayPlanDate(startDate: string, offset: number) {
  const [year = 2026, month = 1, day = 1] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}
