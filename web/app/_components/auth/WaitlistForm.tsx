"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation } from "convex/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { trackTikTokButtonClick } from "@/lib/clipstitchr/analytics/trackTikTokButtonClick";
import { trackWaitlistSignupConversion } from "@/lib/clipstitchr/analytics/trackWaitlistSignupConversion";

export function WaitlistForm() {
  const submitWaitlistEntry = useMutation(api.waitlist.submit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    trackTikTokButtonClick({
      contentCategory: "Waitlist",
      contentId: "waitlist_submit_button",
      contentName: "Join waitlist",
    });

    try {
      const result = await submitWaitlistEntry({ name, email });

      if (result.status === "created") {
        void trackWaitlistSignupConversion({ email });
      }

      setIsSubmitted(true);
      setName("");
      setEmail("");
    } catch (error) {
      const serverMessage = error instanceof Error ? error.message : "";

      if (serverMessage.includes("Too many waitlist submissions")) {
        setErrorMessage("Too many waitlist submissions. Try again later.");
      } else if (serverMessage.includes("name between")) {
        setErrorMessage("Enter a name between 2 and 120 characters.");
      } else if (serverMessage.includes("valid email address")) {
        setErrorMessage("Enter a valid email address.");
      } else {
        setErrorMessage("Unable to join the waitlist right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-accent-dark">Invite-only beta</p>
      <h2 className="mt-3 text-2xl font-bold text-text-primary">
        Join the ClipStitchr waitlist
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Sign-ups are closed while access stays private. Leave your details and
        you will be first in line when more seats open.
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
                Your waitlist request is saved, and you will hear back when
                access opens.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-text-primary">
            Name
            <input
              required
              minLength={2}
              maxLength={120}
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
              maxLength={320}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="h-11 rounded-lg border border-border bg-white px-3 text-sm font-medium text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
              placeholder="you@example.com"
            />
          </label>
          {errorMessage && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-text-tertiary"
          >
            {isSubmitting ? "Joining..." : "Join waitlist"}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </form>
      )}

      <div className="mt-6 border-t border-border pt-5 text-sm text-text-secondary">
        Already have access?{" "}
        <Link href="/sign-in" className="font-bold text-accent-dark">
          Sign in
        </Link>
      </div>
    </div>
  );
}
