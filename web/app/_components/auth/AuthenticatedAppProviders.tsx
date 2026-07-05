import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { CookieConsentIdentityReporters } from "@/app/_components/analytics/CookieConsentIdentityReporters";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";

type AuthenticatedAppProvidersProps = {
  children: ReactNode;
};

export function AuthenticatedAppProviders({
  children,
}: AuthenticatedAppProvidersProps) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <CookieConsentIdentityReporters />
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
  );
}
