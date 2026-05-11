const DEFAULT_CLIPR_VIDEO_MODEL_ID = "bytedance/seedance-2.0";

export function getCliprVideoModelId() {
  return process.env.CLIPR_VIDEO_MODEL_ID ?? DEFAULT_CLIPR_VIDEO_MODEL_ID;
}
