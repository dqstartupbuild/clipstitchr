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
      className="rounded-xl bg-[#151a18] p-5 text-white sm:p-7"
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
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#b9c2be]">
        Paste a TikTok or Instagram video, Reel, or slideshow. Mobile share
        links work too. Hook Lab will save it and explain what happens.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          id="hook-lab-post-url"
          autoComplete="url"
          className="min-h-12 w-full rounded-lg border border-[#46504b] bg-[#222825] px-4 text-base text-white outline-none placeholder:text-[#89928e] focus:border-[#d7e2dc] focus:ring-2 focus:ring-white/15"
          disabled={isCreating}
          inputMode="url"
          placeholder="Paste a TikTok or Instagram link"
          type="text"
          value={url}
          onChange={(event) => setUrl(event.currentTarget.value)}
        />
        <Button
          className="min-h-12 bg-[#eef4f0] px-5 text-[#151a18] hover:bg-white"
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
