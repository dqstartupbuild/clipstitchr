"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { disconnectSocialAccount } from "@/lib/clipstitchr/client/disconnectSocialAccount";
import { startSocialOAuthConnection } from "@/lib/clipstitchr/client/startSocialOAuthConnection";
import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";
import { SocialPlatformMark } from "./SocialPlatformMark";

type SocialAccountRowProps = {
  account: {
    id: string;
    platform: SocialPlatform;
    username: string;
    displayName?: string;
    accountType?: string;
    status: string;
    scopes: string[];
    capabilityCheckedAt?: string;
    lastErrorMessage?: string;
    createdAt: string;
  };
};

export function SocialAccountRow({ account }: SocialAccountRowProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const platformLabel =
    account.platform === "tiktok" ? "TikTok" : "Instagram";
  const connected = account.status === "connected";

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        `Disconnect ${account.displayName || account.username}? Future posts for this account will be held for review.`,
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      await disconnectSocialAccount(account.id);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : `Unable to disconnect ${platformLabel}.`,
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <article className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <SocialPlatformMark
            platform={account.platform}
            className="h-5 w-5 shrink-0 text-text-primary"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-text-primary">
              {account.displayName || account.username}
            </h3>
            <p className="truncate text-sm text-text-secondary">
              {platformLabel} · @{account.username}
            </p>
          </div>
        </div>
        <p
          className={[
            "mt-2 text-sm font-semibold",
            connected ? "text-emerald-300" : "text-amber-300",
          ].join(" ")}
        >
          {connected ? "Connected" : "Needs attention"}
        </p>
        {account.lastErrorMessage ? (
          <p className="mt-1 text-sm leading-6 text-amber-200">
            {account.lastErrorMessage}
          </p>
        ) : null}
        {error ? (
          <p className="mt-2 text-sm font-semibold text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <details className="mt-3 text-sm text-text-secondary">
          <summary className="cursor-pointer font-semibold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Connection details
          </summary>
          <dl className="mt-2 grid gap-2 pl-1 sm:grid-cols-2">
            <div>
              <dt className="text-text-tertiary">Account type</dt>
              <dd>{account.accountType || platformLabel}</dd>
            </div>
            <div>
              <dt className="text-text-tertiary">Connected</dt>
              <dd>{new Date(account.createdAt).toLocaleString()}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-text-tertiary">Access granted</dt>
              <dd>{account.scopes.join(", ") || "Basic publishing access"}</dd>
            </div>
          </dl>
        </details>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        {!connected ? (
          <Button
            type="button"
            size="sm"
            onClick={() =>
              void startSocialOAuthConnection(account.platform)
            }
          >
            Reconnect
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="danger"
          isLoading={isDisconnecting}
          onClick={() => void handleDisconnect()}
        >
          Disconnect
        </Button>
      </div>
    </article>
  );
}
