"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { getErrorMessage } from "@/lib/clipstitchr/utils/getErrorMessage";

type HookLabPostComposerProps = {
  isCreating: boolean;
  onCreate: (url: string) => Promise<unknown>;
  onError: (message: string | null) => void;
};

export function HookLabPostComposer({
  isCreating,
  onCreate,
  onError,
}: HookLabPostComposerProps) {
  const [url, setUrl] = useState("");

  return (
    <form
      className="rounded-xl border border-border bg-surface-elevated p-5 text-text-primary sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        onError(null);
        void onCreate(url)
          .then(() => setUrl(""))
          .catch((error) =>
            onError(getErrorMessage(error, "Unable to save that post.")),
          );
      }}
    >
      <label
        className="block text-base font-semibold"
        htmlFor="hook-lab-post-url"
      >
        Add a public post
      </label>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
        Paste a TikTok or Instagram video, Reel, or slideshow. Mobile share
        links work too. Hook Lab will save it and explain what happens.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id="hook-lab-post-url"
          autoComplete="url"
          className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-base text-text-primary outline-none placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20"
          disabled={isCreating}
          inputMode="url"
          placeholder="Paste a TikTok or Instagram link"
          type="text"
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
        />
        <Button
          className="min-h-12 px-5"
          disabled={!url.trim()}
          isLoading={isCreating}
          type="submit"
        >
          Save and analyze
        </Button>
      </div>
    </form>
  );
}
