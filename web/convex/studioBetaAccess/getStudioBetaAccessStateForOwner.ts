import { getStudioBetaGlobalEnabled } from "../../lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled";
import type { StudioBetaAccessState } from "../../lib/clipstitchr/types/StudioBetaAccessState";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getStudioBetaAccessGrantForOwner } from "./getStudioBetaAccessGrantForOwner";
import { getStudioBetaPreferenceForOwner } from "./getStudioBetaPreferenceForOwner";

export async function getStudioBetaAccessStateForOwner(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
): Promise<StudioBetaAccessState> {
  const [grant, preference] = await Promise.all([
    getStudioBetaAccessGrantForOwner(ctx, ownerId),
    getStudioBetaPreferenceForOwner(ctx, ownerId),
  ]);
  const isGloballyEnabled = getStudioBetaGlobalEnabled();
  const isAllowlisted = grant?.status === "active";
  const isEnabled = preference?.enabled === true;

  return {
    isAllowlisted,
    isEnabled,
    isGloballyEnabled,
    hasAccess: isGloballyEnabled && isAllowlisted && isEnabled,
  };
}
