"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { startSocialOAuthConnection } from "@/lib/clipstitchr/client/startSocialOAuthConnection";
import { SocialAccountRow } from "@/app/_components/social/SocialAccountRow";
import { SocialConnectionNotice } from "@/app/_components/social/SocialConnectionNotice";
import { SocialMigrationNotice } from "@/app/_components/social/SocialMigrationNotice";
import { SocialPlatformMark } from "@/app/_components/social/SocialPlatformMark";

type SettingsSocialAccountsPanelProps = {
  connectionPlatform?: string;
  connectionReason?: string;
  connectionStatus?: string;
};

export function SettingsSocialAccountsPanel({
  connectionPlatform,
  connectionReason,
  connectionStatus,
}: SettingsSocialAccountsPanelProps) {
  const { isAuthenticated } = useConvexAuth();
  const [connectingPlatform, setConnectingPlatform] = useState<
    "tiktok" | "instagram" | null
  >(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const accounts = useQuery(
    api.socialAccounts.listSocialAccounts.listSocialAccounts,
    isAuthenticated ? {} : "skip",
  );

  const handleConnect = async (platform: "tiktok" | "instagram") => {
    setConnectingPlatform(platform);
    setConnectionError(null);

    try {
      await startSocialOAuthConnection(platform);
    } catch (error) {
      setConnectionError(
        error instanceof Error
          ? error.message
          : `Unable to connect ${platform === "tiktok" ? "TikTok" : "Instagram"}.`,
      );
      setConnectingPlatform(null);
    }
  };

  return (
    <Panel className="p-4">
      <div className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              Social accounts
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              Connect where you post
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
              Connect each TikTok or professional Instagram account directly
              to ClipStitchr. Add as many as your work needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={<SocialPlatformMark platform="tiktok" className="h-4 w-4" />}
              isLoading={connectingPlatform === "tiktok"}
              disabled={connectingPlatform !== null}
              onClick={() => void handleConnect("tiktok")}
            >
              Connect TikTok
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              icon={
                <SocialPlatformMark platform="instagram" className="h-4 w-4" />
              }
              isLoading={connectingPlatform === "instagram"}
              disabled={connectingPlatform !== null}
              onClick={() => void handleConnect("instagram")}
            >
              Connect Instagram
            </Button>
          </div>
        </div>
        <SocialConnectionNotice
          platform={connectionPlatform}
          reason={connectionReason}
          status={connectionStatus}
        />
        {connectionError ? (
          <p
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
            role="alert"
          >
            {connectionError}
          </p>
        ) : null}
        <div className="divide-y divide-border">
          {accounts === undefined ? (
            <p className="py-4 text-sm font-semibold text-text-secondary">
              Loading connected accounts...
            </p>
          ) : accounts.length > 0 ? (
            accounts.map((account) => (
              <SocialAccountRow key={account.id} account={account} />
            ))
          ) : (
            <p className="py-4 text-sm leading-6 text-text-secondary">
              No social accounts are connected yet.
            </p>
          )}
        </div>
        <SocialMigrationNotice />
      </div>
    </Panel>
  );
}
