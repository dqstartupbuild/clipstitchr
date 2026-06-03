import { isIP } from "node:net";

const PRODUCT_WEBSITE_URL_MAX_LENGTH = 2048;

function getHasPrivateIpv4Address(hostname: string) {
  const parts = hostname.split(".").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }

  const [first = 0, second = 0] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function getHasPrivateIpv6Address(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function getHasBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return true;
  }

  if (isIP(normalized) === 4) {
    return getHasPrivateIpv4Address(normalized);
  }

  if (isIP(normalized.replace(/^\[|\]$/g, "")) === 6) {
    return getHasPrivateIpv6Address(normalized);
  }

  return false;
}

export function normalizeProductWebsiteUrl(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > PRODUCT_WEBSITE_URL_MAX_LENGTH) {
    throw new Error("Website URL is too long.");
  }

  let url: URL;

  try {
    url = new URL(
      /^[a-z][a-z\d+\-.]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
  } catch {
    throw new Error("Website URL is invalid.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Website URL must use http or https.");
  }

  if (url.username || url.password) {
    throw new Error("Website URL cannot include credentials.");
  }

  if (getHasBlockedHostname(url.hostname)) {
    throw new Error("Website URL must be a public website.");
  }

  url.hash = "";

  return url.toString();
}
