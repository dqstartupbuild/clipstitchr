import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";

export function getHookLabTextModelId() {
  return process.env.HOOK_LAB_TEXT_MODEL_ID?.trim() || getCliprHookModelId();
}
