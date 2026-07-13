import type { ClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityInput";

export const defaultClientContentCapacityInput: ClientContentCapacityInput = {
  capture: { availableHoursPerWeek: 20, hoursPerDeliverable: 1 },
  currentClientCount: 4,
  deliverablesPerClientPerWeek: 3,
  editing: { availableHoursPerWeek: 30, hoursPerDeliverable: 2 },
  productiveTimePercent: 80,
  review: { availableHoursPerWeek: 12, hoursPerDeliverable: 0.5 },
};
