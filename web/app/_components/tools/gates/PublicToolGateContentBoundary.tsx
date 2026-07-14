"use client";

import type { ReactNode } from "react";
import { PublicToolGateCapture } from "@/app/_components/tools/gates/PublicToolGateCapture";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { usePublicToolBrowserUnlock } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolBrowserUnlock";
import { usePublicToolGateAnalytics } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolGateAnalytics";

type PublicToolGateContentBoundaryProps = {
  emailNativeEnrollmentControl?: ReactNode;
  hasFunctionalUnlock: boolean;
  isEmailNativeEnrolled?: boolean;
  isEmailProviderReady?: boolean;
  publicContent: ReactNode;
  toolKey: PublicToolKey;
  unlockedContent: ReactNode;
  variant?: PublicToolGateVariant;
};

export function PublicToolGateContentBoundary({
  emailNativeEnrollmentControl,
  hasFunctionalUnlock,
  isEmailNativeEnrolled = false,
  isEmailProviderReady = false,
  publicContent,
  toolKey,
  unlockedContent,
  variant = "control",
}: PublicToolGateContentBoundaryProps) {
  const isBrowserUnlocked = usePublicToolBrowserUnlock();
  const metadata = getPublicToolGateMetadata(toolKey);
  const isRequested = variant === "hybrid-v1" && hasFunctionalUnlock;
  const isEmailGateActive =
    isRequested &&
    metadata.mode === "email-native" &&
    isEmailProviderReady &&
    Boolean(emailNativeEnrollmentControl);
  const isBrowserGateActive =
    isRequested && metadata.mode !== "email-native";
  const isGateActive = isEmailGateActive || isBrowserGateActive;
  const isUnlocked =
    isGateActive &&
    (isEmailNativeEnrolled || isBrowserUnlocked);

  usePublicToolGateAnalytics({
    isEnabled: true,
    isGateDisplayed: isGateActive && !isUnlocked,
    isResourceUnlocked: isUnlocked,
    isResultDisplayed: true,
    toolKey,
    variant,
  });

  if (!isRequested) {
    return (
      <>
        {publicContent}
        {unlockedContent}
      </>
    );
  }

  if (metadata.mode === "email-native") {
    if (!isEmailProviderReady || !emailNativeEnrollmentControl) {
      return (
        <>
          {publicContent}
          {unlockedContent}
        </>
      );
    }

    return (
      <>
        {publicContent}
        {isEmailNativeEnrolled || isBrowserUnlocked ? unlockedContent : null}
        {isEmailNativeEnrolled ? null : emailNativeEnrollmentControl}
      </>
    );
  }

  return (
    <>
      {publicContent}
      {isBrowserUnlocked ? (
        unlockedContent
      ) : (
        <PublicToolGateCapture
          hasFunctionalUnlock
          isEmailProviderReady={isEmailProviderReady}
          trackLifecycle={false}
          toolKey={toolKey}
          variant={variant}
        />
      )}
    </>
  );
}
