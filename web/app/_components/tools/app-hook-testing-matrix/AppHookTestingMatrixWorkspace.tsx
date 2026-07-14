"use client";

import { useState } from "react";
import { AppHookTestingMatrixPortabilityAction } from "@/app/_components/tools/app-hook-testing-matrix/AppHookTestingMatrixPortabilityAction";
import type { AppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixInput";
import { buildAppHookTestingMatrix } from "@/lib/clipstitchr/tools/appHookTestingMatrix/buildAppHookTestingMatrix";
import { defaultAppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/defaultAppHookTestingMatrixInput";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppHookTestingMatrixWorkspaceProps = {
  variant?: PublicToolGateVariant;
};

export function AppHookTestingMatrixWorkspace({
  variant = "control",
}: AppHookTestingMatrixWorkspaceProps) {
  const [input, setInput] = useState<AppHookTestingMatrixInput>(
    defaultAppHookTestingMatrixInput,
  );
  const result = buildAppHookTestingMatrix(input);

  return (
    <section
      className="px-6 py-16"
      aria-label="App hook testing matrix builder"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="marketing-card grid gap-5 p-6 lg:sticky lg:top-24">
          <div>
            <p className="marketing-eyebrow">Stable test setup</p>
            <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
              Name what stays fixed before adding challengers.
            </h2>
          </div>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Stable audience
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              maxLength={160}
              onChange={(event) =>
                setInput({ ...input, audience: event.target.value })
              }
              value={input.audience}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Stable offer
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              maxLength={160}
              onChange={(event) =>
                setInput({ ...input, offer: event.target.value })
              }
              value={input.offer}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Stable CTA
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              maxLength={120}
              onChange={(event) =>
                setInput({ ...input, stableCta: event.target.value })
              }
              value={input.stableCta}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Hooks, one per line (up to five)
            <textarea
              className="min-h-40 rounded-lg border border-border bg-white p-3"
              maxLength={1200}
              onChange={(event) =>
                setInput({ ...input, hooks: event.target.value.split("\n") })
              }
              value={input.hooks.join("\n")}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Visuals, one per line (up to three)
            <textarea
              className="min-h-28 rounded-lg border border-border bg-white p-3"
              maxLength={800}
              onChange={(event) =>
                setInput({ ...input, visuals: event.target.value.split("\n") })
              }
              value={input.visuals.join("\n")}
            />
          </label>
          <p className="text-xs leading-5 text-text-tertiary">
            Change one thing at a time so the comparison stays easier to
            interpret.
          </p>
        </div>

        <div className="grid gap-4" aria-live="polite">
          <div className="marketing-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="marketing-eyebrow">Controlled matrix</p>
              <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
                {result.cells.length} test cells in two stages
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Run hook-only comparisons first. Change visuals only after
                selecting one hook.
              </p>
            </div>
            <AppHookTestingMatrixPortabilityAction
              result={result}
              variant={variant}
            />
          </div>
          {result.cells.map((cell, index) => (
            <article className="marketing-card p-6" key={cell.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-accent-dark">
                    Cell {index + 1} · {cell.stage}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-text-primary">
                    Changed variable: {cell.changedVariable}
                  </h3>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-text-secondary">
                  CTA stays fixed
                </span>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    Hook
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-text-primary">
                    {cell.hook}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    Visual
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-text-primary">
                    {cell.visual}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-text-tertiary">
                    CTA
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-text-primary">
                    {cell.cta}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 rounded-lg bg-surface-muted p-4 text-sm leading-6 text-text-secondary">
                {cell.instruction}
              </p>
            </article>
          ))}
          <p className="text-xs leading-5 text-text-tertiary">
            This matrix organizes a test. It does not create ads, run campaigns,
            predict performance, or track results.
          </p>
        </div>
      </div>
    </section>
  );
}
