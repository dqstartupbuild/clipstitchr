"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { PublicToolGateMode } from "@/lib/clipstitchr/tools/catalog/PublicToolGateMode";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import { toolLeadFieldLimits } from "@/lib/clipstitchr/tools/toolLeads/toolLeadFieldLimits";
import { useToolLeadCapture } from "@/lib/clipstitchr/tools/toolLeads/useToolLeadCapture";
import { usePublicToolConfirmationReadiness } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolConfirmationReadiness";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";

type ToolLeadCaptureFormProps = {
  gateMode?: PublicToolGateMode;
  isEmailProviderReady?: boolean;
  outcomeCta?: string;
  source: ToolLeadSource;
  unlockOutcome?: string;
  variant?: PublicToolGateVariant;
};

export function ToolLeadCaptureForm({
  gateMode = "open-result",
  isEmailProviderReady,
  outcomeCta = "Unlock browser extras",
  source,
  unlockOutcome = "extra browser tools",
  variant = "control",
}: ToolLeadCaptureFormProps) {
  const isConfirmationReady = usePublicToolConfirmationReadiness();
  const canSendConfirmation =
    isEmailProviderReady ?? isConfirmationReady;
  const isHybrid = variant === "hybrid-v1";
  const {
    email,
    errorMessage,
    isSubmitted,
    isSubmitting,
    name,
    setEmail,
    setName,
    submit,
  } = useToolLeadCapture(source, { gateMode, variant });

  return (
    <section
      className="marketing-card p-6 md:p-8"
      aria-labelledby={`${source}-lead-heading`}
    >
      <p className="text-sm font-bold text-accent-dark">
        {isHybrid ? "Keep this useful" : "More useful ideas"}
      </p>
      <h2
        id={`${source}-lead-heading`}
        className="marketing-subheading mt-3 text-3xl text-text-primary"
      >
        {isHybrid
          ? `Unlock ${unlockOutcome}.`
          : "Get the next app-marketing tool."}
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        {isHybrid
          ? "Add your name and email to unlock this value here and ask to join the ClipStitchr app-marketing mailing list."
          : "Join the ClipStitchr mailing list for practical tools, creative ideas, and product updates made for app founders."}
      </p>
      {isHybrid ? (
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {canSendConfirmation
            ? "Your browser unlocks right away. If your email needs confirming, we will ask before any marketing emails start."
            : "Your browser unlocks right away. Email follow-up is not available yet."}
        </p>
      ) : null}

      {isSubmitted ? (
        <div
          role="status"
          className="mt-6 rounded-lg border border-accent/20 bg-accent/5 p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              aria-hidden
              className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark"
            />
            <div>
              <p className="text-sm font-bold text-text-primary">
                {isHybrid
                  ? "Unlocked in this browser."
                  : "Your details are saved."}
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {isHybrid
                  ? canSendConfirmation
                    ? "Your access is ready here. If this email needs confirming, we will send one short confirmation before marketing emails start."
                    : "Your access is ready here. Email follow-up is not available yet."
                  : "Thanks — your request is saved. Email updates will start only when delivery is available."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="mt-6 grid gap-4"
          data-ph-no-capture="true"
          onSubmit={submit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-text-primary">
              Name
              <input
                required
                minLength={toolLeadFieldLimits.name.min}
                maxLength={toolLeadFieldLimits.name.max}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                data-ph-no-capture="true"
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
                placeholder="Your name"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-text-primary">
              Email
              <input
                required
                type="email"
                minLength={toolLeadFieldLimits.email.min}
                maxLength={toolLeadFieldLimits.email.max}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                data-ph-no-capture="true"
                className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
                placeholder="you@example.com"
              />
            </label>
          </div>
          {errorMessage ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
            >
              {errorMessage}
            </p>
          ) : null}
          {isHybrid ? (
            <p className="text-xs leading-5 text-text-tertiary">
              By continuing, you will unlock {unlockOutcome} in this browser
              and ask to join the ClipStitchr app-marketing mailing list. New
              or previously opted-out email addresses need a quick confirmation
              before marketing emails start. This does not create a
              ClipStitchr account.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-text-tertiary sm:justify-self-start"
          >
            {isSubmitting
              ? isHybrid
                ? "Unlocking..."
                : "Joining..."
              : isHybrid
                ? outcomeCta
                : "Join the mailing list"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </form>
      )}

      <p className="mt-5 text-xs leading-5 text-text-tertiary">
        {isHybrid
          ? "The public tools are free to use. ClipStitchr is a paid product with no free product plan. Unsubscribe from future marketing anytime. Read our "
          : "The tools are free. ClipStitchr is a paid product, and joining this list does not create an account. Unsubscribe anytime. Read our "}
        <Link
          href="/privacy"
          className="font-semibold text-text-secondary underline"
        >
          Privacy Policy
        </Link>
        {isHybrid ? (
          <>
            {" "}and{" "}
            <Link
              href="/terms"
              className="font-semibold text-text-secondary underline"
            >
              Terms
            </Link>
          </>
        ) : null}
        .
      </p>
    </section>
  );
}
