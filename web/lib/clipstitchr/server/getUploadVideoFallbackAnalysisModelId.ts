const DEFAULT_UPLOAD_VIDEO_FALLBACK_ANALYSIS_MODEL_ID =
  "lucataco/qwen2-vl-7b-instruct:bf57361c75677fc33d480d0c5f02926e621b2caa2000347cb74aeae9d2ca07ee";

export function getUploadVideoFallbackAnalysisModelId() {
  return (
    process.env.REPLICATE_UPLOAD_VIDEO_FALLBACK_MODEL_ID ??
    DEFAULT_UPLOAD_VIDEO_FALLBACK_ANALYSIS_MODEL_ID
  );
}
