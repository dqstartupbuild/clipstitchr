"use client";

import type { ReactNode } from "react";
import { SocialPublishingProviderContext } from "./SocialPublishingProviderContext";
import type { SocialPublishingProvider } from "@/lib/clipstitchr/social/types/SocialPublishingProvider";

type SocialPublishingProviderProviderProps = {
  children: ReactNode;
  provider: SocialPublishingProvider;
};

export function SocialPublishingProviderProvider({
  children,
  provider,
}: SocialPublishingProviderProviderProps) {
  return (
    <SocialPublishingProviderContext.Provider value={provider}>
      {children}
    </SocialPublishingProviderContext.Provider>
  );
}
