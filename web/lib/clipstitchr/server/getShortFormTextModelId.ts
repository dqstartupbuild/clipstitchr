import { DEFAULT_SHORT_FORM_TEXT_MODEL_ID } from "@/lib/clipstitchr/constants/defaultShortFormTextModelId";

export function getShortFormTextModelId() {
  return (
    process.env.SHORT_FORM_TEXT_MODEL_ID?.trim() ||
    process.env.CLIPR_HOOK_MODEL_ID?.trim() ||
    DEFAULT_SHORT_FORM_TEXT_MODEL_ID
  );
}
