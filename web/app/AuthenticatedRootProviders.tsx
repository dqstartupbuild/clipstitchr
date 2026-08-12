import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import { CookieConsentManager } from "@/app/_components/analytics/CookieConsentManager";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";

type AuthenticatedRootProvidersProps = {
  children: ReactNode;
};

export function AuthenticatedRootProviders({
  children,
}: AuthenticatedRootProvidersProps) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard/onboarding"
    >
      <CookieConsentManager />
      <ConvexClientProvider>
        {children}
        <Analytics />
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
