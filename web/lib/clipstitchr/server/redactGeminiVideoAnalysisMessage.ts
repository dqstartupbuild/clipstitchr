const URL_PATTERN = /https?:\/\/\S+/g;
const MAX_MESSAGE_LENGTH = 500;

export function redactGeminiVideoAnalysisMessage(message: string) {
  const redactedMessage = message.replace(URL_PATTERN, "[redacted-url]");

  if (redactedMessage.length <= MAX_MESSAGE_LENGTH) {
    return redactedMessage;
  }

  return `${redactedMessage.slice(0, MAX_MESSAGE_LENGTH)}...`;
}
