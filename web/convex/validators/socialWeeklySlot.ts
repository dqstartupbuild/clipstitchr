import { v } from "convex/values";

export const socialWeeklySlotValidator = v.object({
  dayOfWeek: v.number(),
  minuteOfDay: v.number(),
});
