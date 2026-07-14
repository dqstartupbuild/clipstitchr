import type { ReactNode } from "react";
import { PublicToolConfirmationReadinessProvider } from "@/app/_components/tools/gates/PublicToolConfirmationReadinessProvider";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";

export default function PublicToolsLayout({ children }: { children: ReactNode }) {
  const isConfirmationReady =
    getLoopsReadiness(process.env).confirmationReady;

  return (
    <PublicToolConfirmationReadinessProvider
      isConfirmationReady={isConfirmationReady}
    >
      {children}
    </PublicToolConfirmationReadinessProvider>
  );
}
