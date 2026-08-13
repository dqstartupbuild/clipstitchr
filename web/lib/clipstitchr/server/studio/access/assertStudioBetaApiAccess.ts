import "server-only";

import { StudioBetaApiAccessError } from "./StudioBetaApiAccessError";
import { getStudioBetaServerAccessState } from "./getStudioBetaServerAccessState";

export async function assertStudioBetaApiAccess() {
  const accessState = await getStudioBetaServerAccessState();

  if (!accessState.isAuthenticated) {
    throw new StudioBetaApiAccessError(401);
  }

  if (!accessState.hasAccess || !accessState.userId) {
    throw new StudioBetaApiAccessError(403);
  }

  return {
    userId: accessState.userId,
  };
}
