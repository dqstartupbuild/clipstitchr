const DEFAULT_UPLOAD_VIDEO_ANALYSIS_MODEL_ID = "google/gemini-3-flash";

export function getUploadVideoAnalysisModelId() {
  return (
    process.env.REPLICATE_UPLOAD_VIDEO_ANALYSIS_MODEL_ID ??
    DEFAULT_UPLOAD_VIDEO_ANALYSIS_MODEL_ID
  );
}
