"use client";

import { ToolLeadCaptureForm } from "@/app/_components/tools/ToolLeadCaptureForm";
import { PublicToolEmailNativeEnrollmentControl } from "@/app/_components/tools/gates/PublicToolEmailNativeEnrollmentControl";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { usePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock";
import { usePublicToolConfirmationReadiness } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolConfirmationReadiness";
import { usePublicToolGateAnalytics } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolGateAnalytics";
import { publicToolPortfolioUnlockCopy } from "@/lib/clipstitchr/tools/publicToolGates/publicToolPortfolioUnlockCopy";

type PublicToolGateCaptureProps = {
  hasFunctionalUnlock: boolean;
  hasCourseAccess?: boolean;
  hasCourseSession?: boolean;
  isEmailProviderReady?: boolean;
  isResultDisplayed?: boolean;
  trackLifecycle?: boolean;
  toolKey: PublicToolKey;
  variant?: PublicToolGateVariant;
};

export function PublicToolGateCapture({
  hasFunctionalUnlock,
  hasCourseAccess = false,
  hasCourseSession = false,
  isEmailProviderReady,
  isResultDisplayed = false,
  trackLifecycle = true,
  toolKey,
  variant = "control",
}: PublicToolGateCaptureProps) {
  const isBrowserUnlocked = usePublicToolBrowserUnlock();
  const isConfirmationReady = usePublicToolConfirmationReadiness();
  const metadata = getPublicToolGateMetadata(toolKey);
  const isEmailGateReady =
    metadata.mode !== "email-native" || isEmailProviderReady === true;
  const isGateActive =
    variant === "hybrid-v1" &&
    isEmailGateReady &&
    (metadata.mode !== "email-native" || hasFunctionalUnlock);
  const outcomeCta = hasFunctionalUnlock
    ? metadata.outcomeCta
    : publicToolPortfolioUnlockCopy.outcomeCta;
  const unlockOutcome = hasFunctionalUnlock
    ? metadata.value.unlockedValue
    : publicToolPortfolioUnlockCopy.unlockedValue;

  usePublicToolGateAnalytics({
    isEnabled: trackLifecycle,
    isGateDisplayed:
      isGateActive &&
      (metadata.mode === "email-native"
        ? !hasCourseAccess
        : !isBrowserUnlocked),
    isResourceUnlocked:
      isGateActive &&
      (metadata.mode === "email-native"
        ? hasCourseAccess
        : isBrowserUnlocked),
    isResultDisplayed,
    toolKey,
    variant,
  });

  if (
    (metadata.mode === "email-native" && hasCourseAccess) ||
    (isGateActive && metadata.mode !== "email-native" && isBrowserUnlocked)
  ) {
    return null;
  }

  if (!isGateActive) {
    return <ToolLeadCaptureForm source={toolKey} />;
  }

  return (
    <>
      {metadata.mode === "email-native" &&
      hasCourseSession &&
      !hasCourseAccess ? (
        <PublicToolEmailNativeEnrollmentControl toolKey={toolKey} />
      ) : null}
      <ToolLeadCaptureForm
        gateMode={metadata.mode}
        isEmailProviderReady={isEmailProviderReady ?? isConfirmationReady}
        outcomeCta={outcomeCta}
        source={toolKey}
        unlockOutcome={unlockOutcome}
        variant={variant}
      />
    </>
  );
}
