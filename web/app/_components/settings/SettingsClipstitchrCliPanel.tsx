import { ArrowUpRight, Terminal } from "lucide-react";
import Link from "next/link";
import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";

const installCommand = "npm install -g clipstitchr";

export function SettingsClipstitchrCliPanel() {
  return (
    <Panel className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold text-accent-dark">
            <Terminal aria-hidden className="h-4 w-4" />
            ClipStitchr CLI
          </div>
          <h3 className="mt-3 text-lg font-bold text-text-primary">
            Run ClipStitchr from your product repo.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Install the command, connect this repo, record demos, start batch
            drafts, and add ready Stitches to your queue.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
            <code className="text-sm font-bold text-text-primary">
              {installCommand}
            </code>
            <CopyTextButton
              text={installCommand}
              label="Copy"
              copiedLabel="Copied"
              className="h-8 px-2"
            />
          </div>
          <Link
            href="/docs/clipstitchr-cli"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:border-accent hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Setup guide
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Panel>
  );
}
