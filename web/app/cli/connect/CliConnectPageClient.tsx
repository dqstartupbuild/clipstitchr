"use client";

import {
  useClerk,
  useUser,
} from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { Button } from "@/app/_components/ui/Button";

type CliConnectPageClientProps = {
  userCode?: string;
};

type ApprovalState = "ready" | "approving" | "approved" | "redirecting" | "error";

export function CliConnectPageClient({
  userCode,
}: CliConnectPageClientProps) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn } = useUser();
  const [state, setState] = useState<ApprovalState>("ready");
  const [code, setCode] = useState(userCode ?? "");
  const [message, setMessage] = useState("");
  const isRedirectingToSignIn = isLoaded && !isSignedIn;

  useEffect(() => {
    if (!isLoaded || isSignedIn) {
      return;
    }

    void clerk.redirectToSignIn({
      redirectUrl:
        typeof window === "undefined" ? undefined : window.location.href,
    });
  }, [clerk, isLoaded, isSignedIn]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setState("error");
      setMessage("Enter the code from Terminal first.");
      return;
    }

    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setState("redirecting");
      setMessage("Taking you to sign in first.");
      void clerk.redirectToSignIn({
        redirectUrl:
          typeof window === "undefined" ? undefined : window.location.href,
      });
      return;
    }

    setState("approving");
    setMessage("");

    try {
      const response = await fetch("/api/cli/auth/approve", {
        body: JSON.stringify({ userCode: normalizedCode }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (response.status === 401) {
        setState("redirecting");
        setMessage("Taking you to sign in first.");
        void clerk.redirectToSignIn({
          redirectUrl:
            typeof window === "undefined" ? undefined : window.location.href,
        });
        return;
      }

      const result = (await response.json()) as {
        message?: string;
        status?: string;
      };

      if (response.ok && result.status === "approved") {
        setState("approved");
        setMessage("This machine is connected. You can go back to Terminal.");
        return;
      }

      setState("error");
      setMessage(result.message ?? "This sign-in code did not work.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "This sign-in code did not work.",
      );
    }
  };

  const visibleMessage = isRedirectingToSignIn
    ? "Taking you to sign in first."
    : message;

  return (
    <main className="flex min-h-screen bg-background px-6 py-8 text-text-primary">
      <section className="mx-auto flex w-full max-w-xl flex-col justify-center">
        <p className="font-mono text-sm font-semibold uppercase text-accent">
          ClipStitchr CLI
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
          Connect this machine
        </h1>

        {state === "approved" ? (
          <div className="mt-6 rounded-lg border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-0.5 h-6 w-6 text-accent" />
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  You are connected.
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  You can close this page and return to Terminal.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg">
              Sign in if asked, make sure this code matches the one in
              Terminal, then connect this machine.
            </p>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-semibold text-text-primary">
                Terminal code
                <input
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    if (state === "error") {
                      setState("ready");
                      setMessage("");
                    }
                  }}
                  className="h-12 rounded-lg border border-border bg-surface px-4 font-mono text-2xl font-bold uppercase tracking-[0.18em] text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
                  placeholder="ABC123"
                />
              </label>

              {visibleMessage ? (
                <p className="text-sm font-semibold text-text-secondary">
                  {visibleMessage}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  isLoading={state === "approving"}
                  disabled={state === "redirecting" || isRedirectingToSignIn}
                >
                  {state === "redirecting" || isRedirectingToSignIn
                    ? "Taking you to sign in"
                    : "Connect this machine"}
                </Button>
                <SecondaryButtonLink href="/">Cancel</SecondaryButtonLink>
              </div>
            </form>
          </>
        )}

        {state === "approved" ? (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButtonLink href="/dashboard">Open Dashboard</PrimaryButtonLink>
            <SecondaryButtonLink href="/">Back Home</SecondaryButtonLink>
          </div>
        ) : null}
      </section>
    </main>
  );
}
