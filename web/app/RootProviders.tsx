import type { ReactNode } from "react";

type RootProvidersProps = {
  children: ReactNode;
  isDevelopmentAuthBypass: boolean;
};

export async function RootProviders({
  children,
  isDevelopmentAuthBypass,
}: RootProvidersProps) {
  if (isDevelopmentAuthBypass) {
    return children;
  }

  const { AuthenticatedRootProviders } = await import(
    "@/app/AuthenticatedRootProviders"
  );

  return <AuthenticatedRootProviders>{children}</AuthenticatedRootProviders>;
}
