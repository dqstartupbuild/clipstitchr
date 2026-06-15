import { getUploadAnalysisModelId } from "@/lib/clipstitchr/server/getUploadAnalysisModelId";

const DEFAULT_UPLOAD_ANALYSIS_BACKUP_MODEL_ID = "openai/gpt-4.1-mini";

function normalizeBackupModelId(value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue || normalizedValue === "none") {
    return undefined;
  }

  return normalizedValue;
}

export function getUploadAnalysisModelIds() {
  const primaryModelId = getUploadAnalysisModelId();
  const backupModelId = normalizeBackupModelId(
    process.env.REPLICATE_UPLOAD_ANALYSIS_BACKUP_MODEL_ID ??
      DEFAULT_UPLOAD_ANALYSIS_BACKUP_MODEL_ID,
  );

  return Array.from(
    new Set([primaryModelId, backupModelId].filter(Boolean) as string[]),
  );
}
