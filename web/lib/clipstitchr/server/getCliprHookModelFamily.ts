type CliprHookModelFamily = "anthropic-claude" | "openai-chat";

export function getCliprHookModelFamily(
  modelId: string,
): CliprHookModelFamily {
  const trimmedModelId = modelId.trim();
  const versionSeparatorIndex = trimmedModelId.indexOf(":");
  const baseModelId =
    versionSeparatorIndex === -1
      ? trimmedModelId
      : trimmedModelId.slice(0, versionSeparatorIndex).trim();

  if (baseModelId.startsWith("anthropic/claude-")) {
    return "anthropic-claude";
  }

  return "openai-chat";
}
