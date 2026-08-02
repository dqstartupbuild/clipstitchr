const CREDENTIAL_STRING_PATTERNS = [
  /^bearer\s+\S+$/i,
  /^cst1\.[A-Za-z0-9_.-]+$/,
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
];

export const redactLogString = (value: string): string => {
  if (CREDENTIAL_STRING_PATTERNS.some((pattern) => pattern.test(value))) {
    return "[REDACTED]";
  }

  if (!/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const url = new URL(value);

    if (
      url.username.length === 0 &&
      url.password.length === 0 &&
      url.search.length === 0 &&
      url.hash.length === 0
    ) {
      return value;
    }

    return `${url.origin}${url.pathname}${url.search.length > 0 ? "?[REDACTED]" : ""}${
      url.hash.length > 0 ? "#[REDACTED]" : ""
    }`;
  } catch {
    return "[REDACTED]";
  }
};
