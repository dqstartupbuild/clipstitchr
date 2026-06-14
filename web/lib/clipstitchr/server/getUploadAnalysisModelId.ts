const DEFAULT_UPLOAD_ANALYSIS_MODEL_ID = "openai/gpt-5-mini";

export function getUploadAnalysisModelId() {
  return (
    process.env.REPLICATE_UPLOAD_ANALYSIS_MODEL_ID ??
    DEFAULT_UPLOAD_ANALYSIS_MODEL_ID
  );
}
