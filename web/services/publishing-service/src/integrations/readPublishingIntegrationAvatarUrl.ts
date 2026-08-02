export const readPublishingIntegrationAvatarUrl = (
  value: string | null,
): string | null => {
  if (value === null || value.length > 2_048) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.username.length === 0 &&
      url.password.length === 0 &&
      url.hash.length === 0 &&
      ![...url.searchParams.keys()].some((key) =>
        /^(?:access_token|authorization|signature|sig|token|x-amz-.+)$/iu.test(
          key,
        ),
      )
      ? url.toString()
      : null;
  } catch {
    return null;
  }
};
