"use client";

import { CheckCircle2, KeyRound, Settings2, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SettingsSocialPublishingProductConfigDialog } from "@/app/_components/settings/SettingsSocialPublishingProductConfigDialog";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { deleteSocialPublishingSettings } from "@/lib/clipstitchr/client/deleteSocialPublishingSettings";
import { fetchSocialPublishingSettings } from "@/lib/clipstitchr/client/fetchSocialPublishingSettings";
import { saveSocialPublishingSettings } from "@/lib/clipstitchr/client/saveSocialPublishingSettings";
import type { SocialPublishingSettings } from "@/lib/clipstitchr/types/SocialPublishingSettings";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type SettingsSocialPublishingPanelProps = {
  isProductActionDisabled: boolean;
  products: ProductProfile[];
};

export function SettingsSocialPublishingPanel({
  isProductActionDisabled,
  products,
}: SettingsSocialPublishingPanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [settings, setSettings] = useState<SocialPublishingSettings>({
    hasApiKey: false,
  });
  const [connectedAccountCount, setConnectedAccountCount] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isBusy = isLoading || isSaving || isDeleting;

  useEffect(() => {
    let isActive = true;

    void fetchSocialPublishingSettings()
      .then((nextSettings) => {
        if (!isActive) {
          return;
        }

        setSettings(nextSettings);
      })
      .catch((nextError) => {
        if (!isActive) {
          return;
        }

        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load Zernio settings.",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const result = await saveSocialPublishingSettings(apiKey);

      setSettings(result.settings);
      setConnectedAccountCount(result.accounts.length);
      setApiKey("");
      setMessage("Zernio is connected.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save Zernio settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setMessage(null);
    setIsDeleting(true);

    try {
      setSettings(await deleteSocialPublishingSettings());
      setConnectedAccountCount(null);
      setApiKey("");
      setIsConfigOpen(false);
      setMessage("Zernio was disconnected.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to remove Zernio settings.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Panel className="p-4">
      <form className="relative flex flex-col gap-4" onSubmit={handleSave}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent-dark">
              Zernio
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              Connect your posting account
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Connect your own Zernio account. Your first two social accounts
              are free, and you control any upgrades directly with Zernio.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {settings.hasApiKey ? (
              <span className="inline-flex h-9 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
                Connected
              </span>
            ) : null}
            {settings.hasApiKey ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Settings2 aria-hidden className="h-4 w-4" />}
                disabled={isLoading}
                onClick={() => setIsConfigOpen(true)}
              >
                Choose accounts
              </Button>
            ) : null}
          </div>
        </div>

        {!settings.hasApiKey ? (
          <p className="text-sm leading-6 text-text-secondary">
            First,{" "}
            <a
              className="font-semibold text-accent-dark hover:text-accent"
              href="https://zernio.com/pricing"
              target="_blank"
              rel="noreferrer"
            >
              create a free Zernio account
            </a>
            , connect your social accounts, then create a profile-scoped
            read-write key under Settings and API Keys.{" "}
            <a
              className="font-semibold text-accent-dark hover:text-accent"
              href="https://docs.zernio.com/"
              target="_blank"
              rel="noreferrer"
            >
              View Zernio’s setup guide
            </a>
            .
          </p>
        ) : null}

        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Zernio API key
          </span>
          <input
            value={apiKey}
            type="password"
            autoComplete="off"
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder={
              settings.apiKeyLast4
                ? `Saved key ending in ${settings.apiKeyLast4}`
                : "Paste your Zernio key"
            }
            disabled={isBusy}
            onChange={(event) => setApiKey(event.currentTarget.value)}
          />
        </label>

        {connectedAccountCount !== null ? (
          <p className="text-sm font-semibold text-text-secondary">
            Found {connectedAccountCount} supported account
            {connectedAccountCount === 1 ? "" : "s"}.
          </p>
        ) : null}

        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          {settings.hasApiKey ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={<Trash2 aria-hidden className="h-4 w-4" />}
              isLoading={isDeleting}
              disabled={isBusy}
              onClick={() => void handleDelete()}
            >
              Disconnect
            </Button>
          ) : null}
          <Button
            type="submit"
            size="sm"
            icon={<KeyRound aria-hidden className="h-4 w-4" />}
            isLoading={isSaving}
            disabled={isBusy || !apiKey.trim()}
          >
            Save and test
          </Button>
        </div>
      </form>
      {isConfigOpen ? (
        <SettingsSocialPublishingProductConfigDialog
          hasApiKey={settings.hasApiKey}
          isDisabled={isBusy || isProductActionDisabled}
          products={products}
          onClose={() => setIsConfigOpen(false)}
        />
      ) : null}
    </Panel>
  );
}
