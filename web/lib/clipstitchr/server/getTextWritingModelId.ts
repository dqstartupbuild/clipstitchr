import { DEFAULT_TEXT_WRITING_MODEL_ID } from "@/lib/clipstitchr/constants/defaultTextWritingModelId";
import { readTextWritingModelEnvValue } from "@/lib/clipstitchr/server/readTextWritingModelEnvValue";

export function getTextWritingModelId() {
  return (
    readTextWritingModelEnvValue(process.env.TEXT_WRITING_MODEL_ID) ??
    readTextWritingModelEnvValue(process.env.CLIPR_HOOK_MODEL_ID) ??
    DEFAULT_TEXT_WRITING_MODEL_ID
  );
}
