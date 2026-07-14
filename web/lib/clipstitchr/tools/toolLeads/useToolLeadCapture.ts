"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { setPublicToolBrowserUnlocked } from "@/lib/clipstitchr/tools/publicToolGates/setPublicToolBrowserUnlocked";
import { trackPublicToolAnalyticsEvent } from "@/lib/clipstitchr/tools/publicToolGates/trackPublicToolAnalyticsEvent";
import { submitToolLead } from "@/lib/clipstitchr/tools/toolLeads/submitToolLead";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";

export function useToolLeadCapture(
  source: ToolLeadSource,
  {
    gateMode = "open-result",
    variant = "control",
  }: {
    gateMode?: PublicToolGateMode;
    variant?: PublicToolGateVariant;
  } = {},
) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await submitToolLead({ email, name, source });

      if (variant === "hybrid-v1") {
        setPublicToolBrowserUnlocked();
      }
      trackPublicToolAnalyticsEvent("tool_lead_accepted", {
        gateMode,
        toolKey: source,
        variant,
      });
      setIsSubmitted(true);
      setName("");
      setEmail("");
    } catch {
      setErrorMessage(
        "We could not save your spot right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    errorMessage,
    isSubmitted,
    isSubmitting,
    name,
    setEmail,
    setName,
    submit,
  };
}
