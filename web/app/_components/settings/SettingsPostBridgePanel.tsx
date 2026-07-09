"use client";

import { CheckCircle2, KeyRound, Settings2, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SettingsPostBridgeProductConfigDropdown } from "@/app/_components/settings/SettingsPostBridgeProductConfigDropdown";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { deletePostBridgeSettings } from "@/lib/clipstitchr/client/deletePostBridgeSettings";
import { fetchPostBridgeSettings } from "@/lib/clipstitchr/client/fetchPostBridgeSettings";
import { savePostBridgeSettings } from "@/lib/clipstitchr/client/savePostBridgeSettings";
import type { PostBridgeSettings } from "@/lib/clipstitchr/types/PostBridgeSettings";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type SettingsPostBridgePanelProps = {
  isProductActionDisabled: boolean;
  products: ProductProfile[];
};

export function SettingsPostBridgePanel({
  isProductActionDisabled,
  products,
}: SettingsPostBridgePanelProps) {
  const [apiKey, setApiKey] = useState("");
  const [settings, setSettings] = useState<PostBridgeSettings>({
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

    void fetchPostBridgeSettings()
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
            : "Unable to load Post Bridge settings.",
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
      const result = await savePostBridgeSettings(apiKey);

      setSettings(result.settings);
      setConnectedAccountCount(result.accounts.length);
      setApiKey("");
      setMessage("Post Bridge is connected.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to save Post Bridge settings.",
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
      setSettings(await deletePostBridgeSettings());
      setConnectedAccountCount(null);
      setApiKey("");
      setIsConfigOpen(false);
      setMessage("Post Bridge was disconnected.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to remove Post Bridge settings.",
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
              Post Bridge
            </p>
            <h2 className="mt-1 text-lg font-bold text-text-primary">
              Connect your posting account
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-secondary">
              Add your own key so scheduled posts go to your connected TikTok,
              Instagram, and YouTube accounts.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {settings.hasApiKey ? (
              <span className="inline-flex h-9 items-center gap-1 rounded-full bg-emerald-50 px-2.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 aria-hidden className="h-3.5 w-3.5" />
                Connected
              </span>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Settings2 aria-hidden className="h-4 w-4" />}
              disabled={isLoading}
              onClick={() => setIsConfigOpen((isOpen) => !isOpen)}
            >
              Config
            </Button>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-text-primary">
            Post Bridge API key
          </span>
          <input
            value={apiKey}
            type="password"
            autoComplete="off"
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-3 font-mono text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            placeholder={
              settings.apiKeyLast4
                ? `Saved key ending in ${settings.apiKeyLast4}`
                : "Paste your Post Bridge key"
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
        <SettingsPostBridgeProductConfigDropdown
          hasApiKey={settings.hasApiKey}
          isDisabled={isBusy || isProductActionDisabled}
          isOpen={isConfigOpen}
          products={products}
        />
      </form>
    </Panel>
  );
}
