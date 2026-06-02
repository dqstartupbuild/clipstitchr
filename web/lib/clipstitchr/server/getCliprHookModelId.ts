import { DEFAULT_CLIPR_HOOK_MODEL_ID } from "@/lib/clipstitchr/constants/defaultCliprHookModelId";

export function getCliprHookModelId() {
  return process.env.CLIPR_HOOK_MODEL_ID?.trim() || DEFAULT_CLIPR_HOOK_MODEL_ID;
}
