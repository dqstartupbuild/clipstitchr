export function truncateQueueListText(text: string, maxLength = 48) {
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed || "-";
  }

  return `${trimmed.slice(0, maxLength - 1)}...`;
}
