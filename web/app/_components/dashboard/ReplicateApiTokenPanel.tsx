"use client";

import { KeyRound, Save, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Badge } from "@/app/_components/ui/Badge";
import { Button } from "@/app/_components/ui/Button";
import { Panel } from "@/app/_components/ui/Panel";
import { useReplicateApiToken } from "@/lib/clipstitchr/hooks/useReplicateApiToken";

export function ReplicateApiTokenPanel() {
  const { hasToken, saveToken, clearToken } = useReplicateApiToken();
  const [draftToken, setDraftToken] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveToken(draftToken);
    setDraftToken("");
  };

  const handleClear = () => {
    clearToken();
    setDraftToken("");
  };

  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-accent">
            <KeyRound aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent-dark">
              Production API
            </p>
            <h2 className="mt-2 text-xl font-bold text-text-primary">
              Replicate API token
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Swapr and AI upload analysis will use this browser-local token.
            </p>
          </div>
        </div>
        <Badge tone={hasToken ? "green" : "amber"}>
          {hasToken ? "Saved locally" : "Not saved"}
        </Badge>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 md:flex-row md:items-end"
        onSubmit={handleSubmit}
      >
        <label className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-text-primary">
            API token
          </span>
          <input
            type="password"
            value={draftToken}
            autoComplete="off"
            placeholder="r8_..."
            className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-tertiary focus:border-accent"
            onChange={(event) => setDraftToken(event.currentTarget.value)}
          />
        </label>
        <div className="flex gap-2">
          <Button
            type="submit"
            icon={<Save aria-hidden className="h-4 w-4" />}
            disabled={!draftToken.trim()}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            icon={<Trash2 aria-hidden className="h-4 w-4" />}
            disabled={!hasToken && !draftToken}
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </form>

      <p className="mt-3 text-xs leading-5 text-text-secondary">
        Stored only in this browser. Remove it before using a shared machine.
      </p>
    </Panel>
  );
}
