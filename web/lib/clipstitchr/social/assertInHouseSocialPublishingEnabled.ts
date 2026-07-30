import { getSocialPublishingProvider } from "./getSocialPublishingProvider";

export function assertInHouseSocialPublishingEnabled() {
  if (getSocialPublishingProvider() !== "in_house") {
    throw new Error("In-house social publishing is not enabled.");
  }
}
