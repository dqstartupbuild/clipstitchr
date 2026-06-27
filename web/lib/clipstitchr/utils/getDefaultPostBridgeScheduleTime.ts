import { createLocalDateTimeInputValue } from "@/lib/clipstitchr/utils/createLocalDateTimeInputValue";

export function getDefaultPostBridgeScheduleTime() {
  return createLocalDateTimeInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000));
}
