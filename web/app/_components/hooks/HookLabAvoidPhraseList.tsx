"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/_components/ui/Button";
import { IconButton } from "@/app/_components/ui/IconButton";

type HookLabAvoidPhraseListProps = {
  phrases: string[];
  onChange: (phrases: string[]) => void;
};

export function HookLabAvoidPhraseList({
  phrases,
  onChange,
}: HookLabAvoidPhraseListProps) {
  const [phrase, setPhrase] = useState("");

  return (
    <div>
      <label className="block">
        <span className="text-sm font-semibold text-text-primary">
          Phrases to avoid
        </span>
        <span className="mt-1 block text-pretty text-xs leading-5 text-text-secondary">
          Add lines that sound fake, tired, or wrong for this product.
        </span>
        <span className="mt-2 flex gap-2">
          <input
            value={phrase}
            maxLength={180}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
            placeholder="A phrase you never want to use"
            onChange={(event) => setPhrase(event.currentTarget.value)}
          />
          <Button
            type="button"
            variant="secondary"
            icon={<Plus aria-hidden className="size-4" />}
            disabled={!phrase.trim()}
            onClick={() => {
              const normalizedPhrase = phrase.trim().replace(/\s+/g, " ");
              const nextPhrases = Array.from(
                new Set([normalizedPhrase, ...phrases]),
              ).slice(0, 20);
              onChange(nextPhrases);
              setPhrase("");
            }}
          >
            Add
          </Button>
        </span>
      </label>
      {phrases.length ? (
        <ul className="mt-3 grid gap-2">
          {phrases.map((savedPhrase) => (
            <li
              key={savedPhrase}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2"
            >
              <span className="min-w-0 break-words text-sm font-semibold text-text-secondary">
                {savedPhrase}
              </span>
              <IconButton
                type="button"
                label={`Remove ${savedPhrase}`}
                icon={<X aria-hidden className="size-4" />}
                onClick={() =>
                  onChange(phrases.filter((item) => item !== savedPhrase))
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-border bg-surface-muted p-3 text-pretty text-sm text-text-secondary">
          Nothing blocked yet. That is okay.
        </p>
      )}
    </div>
  );
}
