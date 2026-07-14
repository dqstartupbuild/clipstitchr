import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";

export function getPublicToolGateRuntimeIsReady(
  toolKey: PublicToolKey,
  {
    emailNativeReady,
    hasConfirmationTokenSecret,
  }: {
    emailNativeReady: boolean;
    hasConfirmationTokenSecret: boolean;
  },
) {
  return getPublicToolGateMetadata(toolKey).mode === "email-native"
    ? emailNativeReady
    : hasConfirmationTokenSecret;
}
