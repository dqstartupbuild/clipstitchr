import { createScreenDemoZoomSegments } from "./createScreenDemoZoomSegments.mjs";

const TIKTOK_OUTPUT_HEIGHT = 1920;
const TIKTOK_OUTPUT_WIDTH = 1080;

const CROP_FILL_FILTER =
  "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1";

function roundEven(value) {
  const rounded = Math.max(2, Math.round(value));

  return rounded % 2 === 0 ? rounded : rounded + 1;
}

function getContainSize({ sourceHeight, sourceWidth }) {
  const sourceAspectRatio = sourceWidth / sourceHeight;
  const outputAspectRatio = TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT;

  if (sourceAspectRatio >= outputAspectRatio) {
    return {
      height: roundEven(TIKTOK_OUTPUT_WIDTH / sourceAspectRatio),
      width: TIKTOK_OUTPUT_WIDTH,
    };
  }

  return {
    height: TIKTOK_OUTPUT_HEIGHT,
    width: roundEven(TIKTOK_OUTPUT_HEIGHT * sourceAspectRatio),
  };
}

function formatDecimal(value) {
  return Number(value.toFixed(4)).toString();
}

function createTimedExpression({ fallback, key, segments }) {
  return segments.reduceRight((expression, segment) => {
    const start = formatDecimal(segment.start);
    const end = formatDecimal(segment.end);

    return `if(between(t\\,${start}\\,${end})\\,${formatDecimal(
      segment[key],
    )}\\,${expression})`;
  }, fallback);
}

function createZoomExpression(segments) {
  return segments.reduceRight((expression, segment) => {
    const start = formatDecimal(segment.start);
    const end = formatDecimal(segment.end);
    const lift = formatDecimal(segment.scale - 1);
    const duration = formatDecimal(segment.end - segment.start);

    return `if(between(t\\,${start}\\,${end})\\,1+${lift}*sin(PI*(t-${start})/${duration})\\,${expression})`;
  }, "1");
}

function createForegroundFilter({ interactionEvents, sourceMetadata }) {
  const containSize = getContainSize({
    sourceHeight: sourceMetadata.height,
    sourceWidth: sourceMetadata.width,
  });
  const segments = createScreenDemoZoomSegments({
    events: interactionEvents,
    sourceDuration: sourceMetadata.duration,
  });

  if (segments.length === 0) {
    return {
      filter: `[fgsrc]scale=${containSize.width}:${containSize.height},setsar=1[fg]`,
      hasZoom: false,
    };
  }

  const focusX = createTimedExpression({
    fallback: "0.5",
    key: "x",
    segments,
  });
  const focusY = createTimedExpression({
    fallback: "0.5",
    key: "y",
    segments,
  });
  const zoom = createZoomExpression(segments);
  const overlayX = `if(lte(w\\,${TIKTOK_OUTPUT_WIDTH})\\,(${TIKTOK_OUTPUT_WIDTH}-w)/2\\,max(${TIKTOK_OUTPUT_WIDTH}-w\\,min(0\\,${TIKTOK_OUTPUT_WIDTH}/2-(${focusX})*w)))`;
  const overlayY = `if(lte(h\\,${TIKTOK_OUTPUT_HEIGHT})\\,(${TIKTOK_OUTPUT_HEIGHT}-h)/2\\,max(${TIKTOK_OUTPUT_HEIGHT}-h\\,min(0\\,${TIKTOK_OUTPUT_HEIGHT}/2-(${focusY})*h)))`;

  return {
    filter: `[fgsrc]scale=w='${containSize.width}*(${zoom})':h='${containSize.height}*(${zoom})':eval=frame,setsar=1[fg]`,
    hasZoom: true,
    overlayX,
    overlayY,
  };
}

function createBackgroundLayoutFilter({ interactionEvents, sourceMetadata }) {
  const foreground = createForegroundFilter({
    interactionEvents,
    sourceMetadata,
  });
  const overlayX = foreground.overlayX ?? `(W-w)/2`;
  const overlayY = foreground.overlayY ?? `(H-h)/2`;

  return [
    "[0:v]split=2[bgsrc][fgsrc]",
    "[bgsrc]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:1,eq=saturation=0.7:brightness=-0.05,setsar=1[bg]",
    foreground.filter,
    `[bg][fg]overlay=x='${overlayX}':y='${overlayY}':eval=frame:shortest=1,setsar=1[v]`,
  ].join(";");
}

export function createUploadNormalizationFilter({
  interactionEvents = [],
  layout,
  sourceMetadata,
}) {
  if (layout === "crop-fill") {
    return {
      mode: "vf",
      value: CROP_FILL_FILTER,
    };
  }

  return {
    mode: "filter-complex",
    value: createBackgroundLayoutFilter({
      interactionEvents:
        layout === "smart-screen-demo" ? interactionEvents : [],
      sourceMetadata,
    }),
  };
}
