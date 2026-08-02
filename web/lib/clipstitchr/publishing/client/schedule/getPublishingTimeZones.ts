export function getPublishingTimeZones(currentTimeZone: string) {
  const supportedValuesOf = (
    Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    }
  ).supportedValuesOf;
  const values = supportedValuesOf
    ? supportedValuesOf("timeZone")
    : [
        "America/Detroit",
        "America/Los_Angeles",
        "America/New_York",
        "Europe/London",
        "UTC",
      ];
  return Array.from(new Set([currentTimeZone, ...values])).sort();
}
