"use client";

import { useState } from "react";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import type { PublicToolEmailNativeEnrollmentStatus } from "@/lib/clipstitchr/tools/publicToolGates/PublicToolEmailNativeEnrollmentStatus";
import { requestPublicToolEmailNativeEnrollment } from "@/lib/clipstitchr/tools/publicToolGates/requestPublicToolEmailNativeEnrollment";

export function usePublicToolEmailNativeEnrollment(toolKey: PublicToolKey) {
  const [status, setStatus] =
    useState<PublicToolEmailNativeEnrollmentStatus>("idle");

  const requestEnrollment = async () => {
    setStatus("submitting");

    try {
      await requestPublicToolEmailNativeEnrollment(toolKey);
      setStatus("accepted");
    } catch {
      setStatus("error");
    }
  };

  return { requestEnrollment, status };
}
