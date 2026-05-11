const DEFAULT_CLIPR_SCRIPT_MODEL_ID = "openai/gpt-4.1";

export function getCliprScriptModelId() {
  return process.env.CLIPR_SCRIPT_MODEL_ID ?? DEFAULT_CLIPR_SCRIPT_MODEL_ID;
}
