"use client";

import { useContext } from "react";
import { SocialPublishingProviderContext } from "./SocialPublishingProviderContext";

export function useSocialPublishingProvider() {
  return useContext(SocialPublishingProviderContext);
}
