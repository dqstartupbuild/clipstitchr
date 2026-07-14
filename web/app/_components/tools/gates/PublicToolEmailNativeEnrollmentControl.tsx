"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { usePublicToolEmailNativeEnrollment } from "@/lib/clipstitchr/tools/publicToolGates/usePublicToolEmailNativeEnrollment";

type PublicToolEmailNativeEnrollmentControlProps = {
  toolKey: PublicToolKey;
};

export function PublicToolEmailNativeEnrollmentControl({
  toolKey,
}: PublicToolEmailNativeEnrollmentControlProps) {
  const { requestEnrollment, status } =
    usePublicToolEmailNativeEnrollment(toolKey);

  return (
    <section className="marketing-card mb-6 p-6 md:p-8">
      <p className="text-sm font-bold text-accent-dark">
        Already used another free tool here?
      </p>
      <h2 className="marketing-subheading mt-3 text-3xl text-text-primary">
        Request this email series with one click.
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        We can use the email securely linked to this browser. The series starts
        only when that address is confirmed and eligible for marketing. You can
        also use the form below to confirm or update your details.
      </p>
      {status === "accepted" ? (
        <div
          className="mt-5 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4"
          role="status"
        >
          <CheckCircle2
            aria-hidden
            className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark"
          />
          <p className="text-sm leading-6 text-text-secondary">
            Request received. If the linked email is ready for marketing, the
            series can start. The form below stays available if confirmation or
            updated details are needed.
          </p>
        </div>
      ) : (
        <>
          <button
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-text-tertiary"
            disabled={status === "submitting"}
            onClick={() => void requestEnrollment()}
            type="button"
          >
            {status === "submitting"
              ? "Requesting..."
              : "Request email enrollment"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
          {status === "error" ? (
            <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
              We could not send that request. Use the form below or try again.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
