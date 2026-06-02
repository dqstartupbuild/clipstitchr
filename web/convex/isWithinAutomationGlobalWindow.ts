import {
  automationGlobalWindowEndUtc,
  automationGlobalWindowStartUtc,
} from "./automationGlobalWindow";

function parseUtcTime(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Automation global window must use HH:mm UTC.");
  }

  return hour * 60 + minute;
}

export function isWithinAutomationGlobalWindow(now: string) {
  const timestamp = Date.parse(now);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const date = new Date(timestamp);
  const currentMinute = date.getUTCHours() * 60 + date.getUTCMinutes();
  const startMinute = parseUtcTime(automationGlobalWindowStartUtc);
  const endMinute = parseUtcTime(automationGlobalWindowEndUtc);

  if (startMinute <= endMinute) {
    return currentMinute >= startMinute && currentMinute < endMinute;
  }

  return currentMinute >= startMinute || currentMinute < endMinute;
}
