const MAX_ZOOM_SEGMENTS = 16;
const MIN_SECONDS_BETWEEN_POINTS = 1.1;
const PAUSE_DISTANCE_PIXELS = 80;
const PAUSE_DURATION_MS = 900;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createPointFromEvent(event) {
  return {
    priority: event.type === "click" ? 2 : 1,
    time: event.timestampMs / 1000,
    x: clamp(event.x / event.viewportWidth, 0.05, 0.95),
    y: clamp(event.y / event.viewportHeight, 0.08, 0.92),
  };
}

function getDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function createPausePoints(events) {
  const points = [];
  let anchor = null;
  let lastPointAt = -Infinity;

  for (const event of events) {
    if (event.type !== "mousemove") {
      anchor = null;
      continue;
    }

    if (!anchor) {
      anchor = event;
      continue;
    }

    if (getDistance(anchor, event) > PAUSE_DISTANCE_PIXELS) {
      anchor = event;
      continue;
    }

    const pauseDuration = event.timestampMs - anchor.timestampMs;
    const pointTime = (anchor.timestampMs + pauseDuration / 2) / 1000;

    if (
      pauseDuration >= PAUSE_DURATION_MS &&
      pointTime - lastPointAt >= MIN_SECONDS_BETWEEN_POINTS
    ) {
      points.push(createPointFromEvent(event));
      lastPointAt = pointTime;
      anchor = event;
    }
  }

  return points;
}

function createZoomSegment(point, sourceDuration) {
  const start = clamp(point.time - 0.55, 0, Math.max(0, sourceDuration - 0.1));
  const end = clamp(point.time + 1.45, start + 0.4, sourceDuration);

  return {
    end,
    scale: point.priority === 2 ? 1.36 : 1.24,
    start,
    x: point.x,
    y: point.y,
  };
}

function sortPointsByTime(first, second) {
  return first.time - second.time || second.priority - first.priority;
}

function selectPoints(points) {
  const selected = [];

  for (const point of points.sort(sortPointsByTime)) {
    const previous = selected[selected.length - 1];

    if (previous && point.time - previous.time < MIN_SECONDS_BETWEEN_POINTS) {
      if (point.priority > previous.priority) {
        selected[selected.length - 1] = point;
      }

      continue;
    }

    selected.push(point);

    if (selected.length >= MAX_ZOOM_SEGMENTS) {
      break;
    }
  }

  return selected;
}

export function createScreenDemoZoomSegments({ events, sourceDuration }) {
  if (!Array.isArray(events) || !Number.isFinite(sourceDuration)) {
    return [];
  }

  const clickPoints = events
    .filter((event) => event.type === "click")
    .map(createPointFromEvent);
  const pausePoints = createPausePoints(events);
  const points = selectPoints([...clickPoints, ...pausePoints]);

  return points
    .map((point) => createZoomSegment(point, sourceDuration))
    .filter((segment) => segment.end > segment.start);
}
