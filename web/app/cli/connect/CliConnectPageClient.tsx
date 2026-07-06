"use client";

import { useEffect, useMemo, useState } from "react";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";

type CliConnectPageClientProps = {
  userCode?: string;
};

type ApprovalState = "idle" | "approving" | "approved" | "signin" | "error";

export function CliConnectPageClient({
  userCode,
}: CliConnectPageClientProps) {
  const [state, setState] = useState<ApprovalState>(userCode ? "idle" : "error");
  const [message, setMessage] = useState(
    userCode ? "" : "Open this page from the ClipStitchr command line.",
  );
  const signInHref = useMemo(() => {
    if (typeof window === "undefined") {
      return "/sign-in";
    }

    const url = new URL("/sign-in", window.location.origin);
    url.searchParams.set("redirect_url", window.location.href);

    return url.toString();
  }, []);

  useEffect(() => {
    if (!userCode || state !== "idle") {
      return;
    }

    let isMounted = true;

    async function approve() {
      setState("approving");

      const response = await fetch("/api/cli/auth/approve", {
        body: JSON.stringify({ userCode }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (!isMounted) {
        return;
      }

      if (response.status === 401) {
        setState("signin");
        setMessage("Sign in first, then this machine can connect.");
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
    }

    approve().catch((error: unknown) => {
      if (!isMounted) {
        return;
      }

      setState("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "This sign-in code did not work.",
      );
    });

    return () => {
      isMounted = false;
    };
  }, [state, userCode]);

  return (
    <main className="flex min-h-screen bg-background px-6 py-8 text-text-primary">
      <section className="mx-auto flex w-full max-w-xl flex-col justify-center">
        <p className="font-mono text-sm font-semibold uppercase text-accent">
          ClipStitchr CLI
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
          Connect this machine
        </h1>
        {userCode ? (
          <p className="mt-4 font-mono text-2xl font-semibold">{userCode}</p>
        ) : null}
        <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg">
          {state === "approving"
            ? "Connecting your terminal now."
            : message}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {state === "signin" ? (
            <PrimaryButtonLink href={signInHref}>Sign in</PrimaryButtonLink>
          ) : null}
          {state === "approved" ? (
            <PrimaryButtonLink href="/dashboard">Open Dashboard</PrimaryButtonLink>
          ) : null}
          {state === "error" ? (
            <SecondaryButtonLink href="/">Back Home</SecondaryButtonLink>
          ) : null}
        </div>
      </section>
    </main>
  );
}
