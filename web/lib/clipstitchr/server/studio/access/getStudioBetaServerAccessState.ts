import "server-only";

import { api } from "@/convex/_generated/api";
import { getDevelopmentAuthBypassRequestStatus } from "@/lib/clipstitchr/development/auth/getDevelopmentAuthBypassRequestStatus";
import { getStudioBetaGlobalEnabled } from "@/lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled";
import type { StudioBetaServerAccessState } from "@/lib/clipstitchr/types/StudioBetaServerAccessState";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";

const deniedState = {
  hasAccess: false,
  isAllowlisted: false,
  isEnabled: false,
};

export async function getStudioBetaServerAccessState(): Promise<StudioBetaServerAccessState> {
  const isGloballyEnabled = getStudioBetaGlobalEnabled();

  if (await getDevelopmentAuthBypassRequestStatus()) {
    return {
      ...deniedState,
      isAuthenticated: false,
      isGloballyEnabled,
      userId: null,
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ...deniedState,
      isAuthenticated: false,
      isGloballyEnabled,
      userId: null,
    };
  }

  if (!isGloballyEnabled) {
    return {
      ...deniedState,
      isAuthenticated: true,
      isGloballyEnabled: false,
      userId,
    };
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Convex authentication is unavailable.");
    }

    const accessState = await createAuthenticatedConvexHttpClient(
      convexToken,
    ).query(
      api.studioBetaAccess.getCurrentStudioBetaAccessState
        .getCurrentStudioBetaAccessState,
      {},
    );

    return {
      ...accessState,
      isAuthenticated: true,
      userId,
    };
  } catch {
    return {
      ...deniedState,
      isAuthenticated: true,
      isGloballyEnabled,
      userId,
    };
  }
}
