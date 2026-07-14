import "server-only";

import { cookies } from "next/headers";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { isPublicToolGateVisitorKey } from "@/lib/clipstitchr/tools/catalog/rollout/isPublicToolGateVisitorKey";
import { parsePublicToolGateRollout } from "@/lib/clipstitchr/tools/catalog/rollout/parsePublicToolGateRollout";
import { publicToolGateVisitorCookieName } from "@/lib/clipstitchr/tools/catalog/rollout/publicToolGateVisitorCookieName";
import { resolvePublicToolGateRollout } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateRollout";
import { getPublicToolGateRuntimeIsReady } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRuntimeIsReady";

export async function resolvePublicToolGateVariantForRequest(
  toolKey: PublicToolKey,
  emailNativeReadyOverride?: boolean,
): Promise<PublicToolGateVariant> {
  const cookieStore = await cookies();
  const visitorKey = cookieStore.get(publicToolGateVisitorCookieName)?.value;

  if (!isPublicToolGateVisitorKey(visitorKey)) return "control";

  const readiness = getLoopsReadiness(process.env);
  const isProviderReady = getPublicToolGateRuntimeIsReady(toolKey, {
    emailNativeReady:
      emailNativeReadyOverride ?? readiness.emailNativeReady,
    hasConfirmationTokenSecret: Boolean(
      process.env.EMAIL_CONFIRMATION_TOKEN_SECRET?.trim(),
    ),
  });

  if (!isProviderReady) return "control";

  return resolvePublicToolGateRollout({
    configuration: parsePublicToolGateRollout(
      process.env.PUBLIC_TOOL_GATE_ROLLOUT,
    ),
    emailProviderReady: isProviderReady,
    opaqueVisitorKey: visitorKey,
    toolKey,
  });
}
