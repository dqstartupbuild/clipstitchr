import type { SocialWeeklySlot } from "./types/SocialWeeklySlot";

export function validateSocialWeeklySlots(slots: SocialWeeklySlot[]) {
  if (!slots.length) {
    throw new Error("Add at least one weekly posting time.");
  }

  const seen = new Set<string>();

  for (const slot of slots) {
    if (
      !Number.isInteger(slot.dayOfWeek) ||
      slot.dayOfWeek < 0 ||
      slot.dayOfWeek > 6
    ) {
      throw new Error("Every queue day must be between Sunday and Saturday.");
    }

    if (
      !Number.isInteger(slot.minuteOfDay) ||
      slot.minuteOfDay < 0 ||
      slot.minuteOfDay > 1_439
    ) {
      throw new Error("Every queue time must be a valid local time.");
    }

    const key = `${slot.dayOfWeek}:${slot.minuteOfDay}`;

    if (seen.has(key)) {
      throw new Error("Each weekly posting time must be unique.");
    }

    seen.add(key);
  }
}
