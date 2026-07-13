import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { ClipNamingSystemResult } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemResult";

type ClipNamingSystemResultsProps = {
  result: ClipNamingSystemResult;
};

export function ClipNamingSystemResults({
  result,
}: ClipNamingSystemResultsProps) {
  return (
    <Panel className="p-5 md:p-6 lg:sticky lg:top-24">
      <PanelHeader
        eyebrow="Copyable naming system"
        title="Clean filename preview"
        description="Use the convention in handoff notes, then copy a filename when you save each clip."
        actions={
          <CopyTextButton label="Copy filename" text={result.filename} />
        }
      />
      <code className="mt-5 block break-all rounded-lg border border-border bg-slate-950 p-4 text-sm font-bold text-white">
        {result.filename}
      </code>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Convention
        </p>
        <code className="mt-2 block break-all rounded-lg bg-slate-50 p-3 text-xs text-text-secondary">
          {result.convention}
        </code>
      </div>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Token legend
        </p>
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {result.legend.map((item) => (
            <div
              key={item.token}
              className="rounded-lg border border-border p-3"
            >
              <dt className="text-xs font-bold text-text-tertiary">
                {item.label}
              </dt>
              <dd className="mt-1 break-all text-sm font-semibold text-text-primary">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-6">
        <p className="text-xs font-bold uppercase text-accent-dark">Examples</p>
        <ul className="mt-2 grid gap-2">
          {result.examples.map((example) => (
            <li
              key={example}
              className="break-all rounded-lg bg-accent/10 p-3 text-xs font-semibold text-text-primary"
            >
              {example}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-xs leading-5 text-text-tertiary">
        Text only. This generator does not rename files, save metadata, or build
        an asset library.
      </p>
    </Panel>
  );
}
