import {
  PUBLISHING_PROVIDERS,
  type PublishingProvider,
} from "./PublishingProvider.js";

const PUBLISHING_PROVIDER_SET = new Set<string>(PUBLISHING_PROVIDERS);

export const isPublishingProvider = (
  value: unknown,
): value is PublishingProvider =>
  typeof value === "string" && PUBLISHING_PROVIDER_SET.has(value);
