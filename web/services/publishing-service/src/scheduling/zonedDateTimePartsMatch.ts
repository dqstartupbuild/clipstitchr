import type { readZonedDateTimeParts } from "./readZonedDateTimeParts.js";

export const zonedDateTimePartsMatch = (
  left: ReturnType<typeof readZonedDateTimeParts>,
  right: ReturnType<typeof readZonedDateTimeParts>,
): boolean =>
  left.year === right.year &&
  left.month === right.month &&
  left.day === right.day &&
  left.hour === right.hour &&
  left.minute === right.minute &&
  left.second === right.second;
