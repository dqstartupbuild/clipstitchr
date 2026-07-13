"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toolLeadFieldLimits } from "@/lib/clipstitchr/tools/toolLeads/toolLeadFieldLimits";
import { useToolLeadCapture } from "@/lib/clipstitchr/tools/toolLeads/useToolLeadCapture";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";

type ToolLeadCaptureFormProps = {
  source: ToolLeadSource;
};

export function ToolLeadCaptureForm({ source }: ToolLeadCaptureFormProps) {
  const {
    email,
    errorMessage,
    isSubmitted,
    isSubmitting,
    name,
    setEmail,
    setName,
    submit,
  } = useToolLeadCapture(source);

  return (
    <section
      className="marketing-card p-6 md:p-8"
      aria-labelledby={`${source}-lead-heading`}
    >
      <p className="text-sm font-bold text-accent-dark">More useful ideas</p>
      <h2
        id={`${source}-lead-heading`}
        className="marketing-subheading mt-3 text-3xl text-text-primary"
      >
        Get the next app-marketing tool.
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        Join the ClipStitchr mailing list for practical tools, creative ideas,
        and product updates made for app founders.
      </p>

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
                You are on the list.
              </p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                The next useful idea will land in your inbox.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={submit}>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-text-tertiary sm:justify-self-start"
          >
            {isSubmitting ? "Joining..." : "Join the mailing list"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </form>
      )}

      <p className="mt-5 text-xs leading-5 text-text-tertiary">
        The tools are free. ClipStitchr is a paid product, and joining this list
        does not create an account. Unsubscribe anytime. Read our{" "}
        <Link
          href="/privacy"
          className="font-semibold text-text-secondary underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </section>
  );
}
