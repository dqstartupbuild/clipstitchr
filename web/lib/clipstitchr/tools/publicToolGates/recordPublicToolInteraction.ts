import type { PublicToolInteractionType } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolInteractionType";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export async function recordPublicToolInteraction(
  toolKey: PublicToolKey,
  interactionType: PublicToolInteractionType,
) {
  await fetch(`/api/tools/${toolKey}/interaction`, {
    body: JSON.stringify({ interactionType }),
    cache: "no-store",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => undefined);
}
