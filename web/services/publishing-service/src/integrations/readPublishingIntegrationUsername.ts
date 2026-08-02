export const readPublishingIntegrationUsername = (
  value: string | null,
): string | null => {
  if (value === null || value.length > 1_024) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("schemaVersion" in parsed) ||
      parsed.schemaVersion !== 1 ||
      !("username" in parsed) ||
      typeof parsed.username !== "string"
    ) {
      return null;
    }

    const username = parsed.username.trim();
    return username.length >= 1 &&
      username.length <= 256 &&
      !/[\u0000-\u001f\u007f]/u.test(username)
      ? username
      : null;
  } catch {
    return null;
  }
};
