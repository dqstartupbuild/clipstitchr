import "server-only";

import { notFound } from "next/navigation";
import { getStudioBetaServerAccessState } from "./getStudioBetaServerAccessState";

export async function assertStudioBetaPageAccess() {
  const accessState = await getStudioBetaServerAccessState();

  if (!accessState.hasAccess || !accessState.userId) {
    notFound();
  }

  return { userId: accessState.userId };
}
