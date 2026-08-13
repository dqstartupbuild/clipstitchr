export function isConfiguredPublishingMediaOrigin(
  value: string,
  configuredOrigin: string | undefined,
) {
  if (!configuredOrigin) {
    return false;
  }

  try {
    const url = new URL(value);
    const configuration = new URL(configuredOrigin);
    const isOriginOnlyConfiguration =
      configuration.protocol === "https:" &&
      !configuration.username &&
      !configuration.password &&
      !configuration.search &&
      !configuration.hash &&
      (configuration.pathname === "/" || configuration.pathname === "");

    return isOriginOnlyConfiguration && url.origin === configuration.origin;
  } catch {
    return false;
  }
}
