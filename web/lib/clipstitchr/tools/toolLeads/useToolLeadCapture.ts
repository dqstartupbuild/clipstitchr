"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { trackPostHogEvent } from "@/lib/clipstitchr/analytics/trackPostHogEvent";
import { submitToolLead } from "@/lib/clipstitchr/tools/toolLeads/submitToolLead";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";

export function useToolLeadCapture(source: ToolLeadSource) {
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

      trackPostHogEvent("tool_lead_accepted", { source });
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
