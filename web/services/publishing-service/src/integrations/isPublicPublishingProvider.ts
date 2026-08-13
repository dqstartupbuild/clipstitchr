import {
  PUBLIC_PUBLISHING_PROVIDERS,
  type PublicPublishingProvider,
} from "./PublicPublishingProvider.js";

const PUBLIC_PROVIDER_SET = new Set<string>(PUBLIC_PUBLISHING_PROVIDERS);

export const isPublicPublishingProvider = (
  value: unknown,
): value is PublicPublishingProvider =>
  typeof value === "string" && PUBLIC_PROVIDER_SET.has(value);
