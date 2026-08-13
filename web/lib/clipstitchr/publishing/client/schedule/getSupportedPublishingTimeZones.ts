const FALLBACK_PUBLISHING_TIME_ZONES = [
  "America/Detroit",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "UTC",
];

export function getSupportedPublishingTimeZones(): string[] {
  const supportedValuesOf = (
    Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    }
  ).supportedValuesOf;
  return supportedValuesOf
    ? supportedValuesOf("timeZone")
    : FALLBACK_PUBLISHING_TIME_ZONES;
}
