"use client";

import { createContext } from "react";
import type { SocialPublishingProvider } from "@/lib/clipstitchr/social/types/SocialPublishingProvider";

export const SocialPublishingProviderContext =
  createContext<SocialPublishingProvider>("post_bridge");
