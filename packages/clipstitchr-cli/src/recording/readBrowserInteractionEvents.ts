import type { Page } from "playwright";
import type { RecordingInteractionEvent } from "./RecordingInteractionEvent.js";

function readFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : undefined;
}

function readInteractionEvent(value: unknown): RecordingInteractionEvent | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const event = value as Partial<RecordingInteractionEvent>;
  const timestampMs = readFiniteNumber(event.timestampMs);
  const x = readFiniteNumber(event.x);
  const y = readFiniteNumber(event.y);
  const viewportWidth = readFiniteNumber(event.viewportWidth);
  const viewportHeight = readFiniteNumber(event.viewportHeight);

  if (
    timestampMs === undefined ||
    x === undefined ||
    y === undefined ||
    !viewportWidth ||
    !viewportHeight
  ) {
    return null;
  }

  if (event.type !== "click" && event.type !== "mousemove") {
    return null;
  }

  return {
    type: event.type,
    timestampMs,
    x,
    y,
    viewportWidth,
    viewportHeight,
  };
}

export async function readBrowserInteractionEvents(page: Page) {
  try {
    const rawEvents = await page.evaluate(() => {
      const reader = (
        globalThis as typeof globalThis & {
          __clipstitchrGetInteractionEvents?: () => unknown;
        }
      ).__clipstitchrGetInteractionEvents;

      return reader?.() ?? [];
    });

    if (!Array.isArray(rawEvents)) {
      return [];
    }

    return rawEvents
      .map(readInteractionEvent)
      .filter((event): event is RecordingInteractionEvent => Boolean(event))
      .slice(-5000);
  } catch {
    return [];
  }
}
