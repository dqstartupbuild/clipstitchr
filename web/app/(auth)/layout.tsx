import type { ReactNode } from "react";
import { AuthenticatedAppProviders } from "@/app/_components/auth/AuthenticatedAppProviders";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <AuthenticatedAppProviders>{children}</AuthenticatedAppProviders>;
}
