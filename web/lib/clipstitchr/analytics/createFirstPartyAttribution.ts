import type { FirstPartyAttribution } from "@/lib/clipstitchr/analytics/FirstPartyAttribution";

const clickIdParamNames = ["ttclid", "gclid", "fbclid", "msclkid"];

function getTrimmedValue(value: string | null, maxLength: number) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue.slice(0, maxLength);
}

export function createFirstPartyAttribution(): FirstPartyAttribution | null {
  if (typeof window === "undefined") {
    return null;
  }

  const searchParams = new URLSearchParams(window.location.search);
  const clickIdType = clickIdParamNames.find((name) => searchParams.has(name));
  const clickId = clickIdType
    ? getTrimmedValue(searchParams.get(clickIdType), 200)
    : undefined;

  return {
    landingPage: getTrimmedValue(
      `${window.location.pathname}${window.location.search}`,
      800,
    ) ?? "/",
    referrer: getTrimmedValue(document.referrer, 800),
    source: getTrimmedValue(searchParams.get("utm_source"), 120),
    medium: getTrimmedValue(searchParams.get("utm_medium"), 120),
    campaign: getTrimmedValue(searchParams.get("utm_campaign"), 200),
    term: getTrimmedValue(searchParams.get("utm_term"), 200),
    content: getTrimmedValue(searchParams.get("utm_content"), 200),
    clickId,
    clickIdType,
    capturedAt: new Date().toISOString(),
  };
}
