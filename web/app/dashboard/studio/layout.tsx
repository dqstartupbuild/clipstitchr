import type { ReactNode } from "react";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";

type StudioBetaLayoutProps = {
  children: ReactNode;
};

export default async function StudioBetaLayout({
  children,
}: StudioBetaLayoutProps) {
  await assertStudioBetaPageAccess();

  return children;
}
