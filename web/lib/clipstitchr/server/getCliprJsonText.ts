export function getCliprJsonText(outputText: string) {
  const trimmedText = outputText.trim();
  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  return codeFenceMatch?.[1]?.trim() ?? trimmedText;
}
