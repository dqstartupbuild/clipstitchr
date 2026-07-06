function readFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : undefined;
}

function readUploadInteractionEvent(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const timestampMs = readFiniteNumber(value.timestampMs);
  const x = readFiniteNumber(value.x);
  const y = readFiniteNumber(value.y);
  const viewportWidth = readFiniteNumber(value.viewportWidth);
  const viewportHeight = readFiniteNumber(value.viewportHeight);

  if (
    timestampMs === undefined ||
    x === undefined ||
    y === undefined ||
    !viewportWidth ||
    !viewportHeight
  ) {
    return null;
  }

  if (value.type !== "click" && value.type !== "mousemove") {
    return null;
  }

  return {
    type: value.type,
    timestampMs: Math.max(0, timestampMs),
    x,
    y,
    viewportWidth,
    viewportHeight,
  };
}

export function readUploadInteractionEvents(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(readUploadInteractionEvent)
    .filter(Boolean)
    .slice(-5000);
}
