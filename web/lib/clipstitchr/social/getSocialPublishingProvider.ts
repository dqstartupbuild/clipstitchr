import type { SocialPublishingProvider } from "./types/SocialPublishingProvider";

export function getSocialPublishingProvider(): SocialPublishingProvider {
  const configured = process.env.SOCIAL_PUBLISHING_PROVIDER?.trim();

  if (!configured || configured === "post_bridge") {
    return "post_bridge";
  }

  if (configured === "in_house") {
    return configured;
  }

  throw new Error(
    "SOCIAL_PUBLISHING_PROVIDER must be in_house or post_bridge.",
  );
}
