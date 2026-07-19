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

function createForegroundFilter(sourceMetadata) {
  const containSize = getContainSize({
    sourceHeight: sourceMetadata.height,
    sourceWidth: sourceMetadata.width,
  });

  return `[fgsrc]scale=${containSize.width}:${containSize.height},setsar=1[fg]`;
}

function createBackgroundLayoutFilter(sourceMetadata) {
  return [
    "[0:v]split=2[bgsrc][fgsrc]",
    "[bgsrc]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:1,eq=saturation=0.7:brightness=-0.05,setsar=1[bg]",
    createForegroundFilter(sourceMetadata),
    "[bg][fg]overlay=x='(W-w)/2':y='(H-h)/2':eval=frame:shortest=1,setsar=1[v]",
  ].join(";");
}

export function createUploadNormalizationFilter({
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
    value: createBackgroundLayoutFilter(sourceMetadata),
  };
}
