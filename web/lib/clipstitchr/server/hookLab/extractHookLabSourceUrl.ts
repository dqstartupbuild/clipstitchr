export function extractHookLabSourceUrl(input: string) {
  const match = input.trim().match(/https:\/\/[^\s<>"']+/i);

  if (!match) {
    return input.trim();
  }

  return match[0].replace(/[),.;!?]+$/, "");
}
