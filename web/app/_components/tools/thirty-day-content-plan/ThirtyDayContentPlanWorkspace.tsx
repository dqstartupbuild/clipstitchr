"use client";

import { useState } from "react";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { ThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentPlanInput";
import { createThirtyDayContentPlan } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/createThirtyDayContentPlan";
import { defaultThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/defaultThirtyDayContentPlanInput";
import { formatThirtyDayContentPlanMarkdown } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/formatThirtyDayContentPlanMarkdown";

export function ThirtyDayContentPlanWorkspace() {
  const [input, setInput] = useState<ThirtyDayContentPlanInput>(
    defaultThirtyDayContentPlanInput,
  );
  const actions = createThirtyDayContentPlan(input);
  const publishingDays = actions.filter(
    (action) => action.kind === "publish",
  ).length;

  return (
    <section className="px-6 py-16" aria-label="30-day content plan builder">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="marketing-card grid gap-5 p-6 lg:sticky lg:top-24">
          <div>
            <p className="marketing-eyebrow">Your inputs</p>
            <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
              Shape a month you can actually finish.
            </h2>
          </div>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            App name
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              maxLength={80}
              onChange={(event) =>
                setInput({ ...input, appName: event.target.value })
              }
              value={input.appName}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Plan start date
            <input
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({ ...input, startDate: event.target.value })
              }
              type="date"
              value={input.startDate}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Main goal
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  goal: event.target.value as ThirtyDayContentPlanInput["goal"],
                })
              }
              value={input.goal}
            >
              <option value="awareness">Reach new people</option>
              <option value="launch">Support a launch</option>
              <option value="activation">Help new users start</option>
              <option value="retention">Bring users back</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Product stage
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  launchStage: event.target
                    .value as ThirtyDayContentPlanInput["launchStage"],
                })
              }
              value={input.launchStage}
            >
              <option value="prelaunch">Prelaunch</option>
              <option value="launch">Launching now</option>
              <option value="growth">Growing</option>
              <option value="evergreen">Evergreen</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Posts each week
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  postsPerWeek: Number(
                    event.target.value,
                  ) as ThirtyDayContentPlanInput["postsPerWeek"],
                })
              }
              value={input.postsPerWeek}
            >
              <option value={2}>2 posts</option>
              <option value={3}>3 posts</option>
              <option value={5}>5 posts</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Camera comfort
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  cameraComfort: event.target
                    .value as ThirtyDayContentPlanInput["cameraComfort"],
                })
              }
              value={input.cameraComfort}
            >
              <option value="off-camera">Stay off camera</option>
              <option value="voiceover">Comfortable with voiceover</option>
              <option value="on-camera">Comfortable on camera</option>
            </select>
          </label>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold text-text-primary">
              Assets you already have
            </legend>
            {[
              ["hasUgc", "UGC clips"],
              ["hasDemo", "App-demo footage"],
              ["hasScreenshots", "App screenshots"],
            ].map(([key, label]) => (
              <label className="flex items-center gap-3 text-sm" key={key}>
                <input
                  checked={
                    input[key as "hasUgc" | "hasDemo" | "hasScreenshots"]
                  }
                  onChange={(event) =>
                    setInput({ ...input, [key]: event.target.checked })
                  }
                  type="checkbox"
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="grid gap-5">
          <div className="marketing-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="text-sm font-bold text-accent-dark">Your month</p>
              <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
                30 useful days, including {publishingDays} publishing days
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Every non-posting day still moves capture, reuse, or learning
                forward.
              </p>
            </div>
            <ResourceDownloadButton
              contents={formatThirtyDayContentPlanMarkdown(actions)}
              fileName="clipstitchr-30-day-content-plan.md"
              label="Download plan"
              type="text/markdown;charset=utf-8"
            />
          </div>
          <ol className="grid gap-3 md:grid-cols-2">
            {actions.map((action) => (
              <li className="marketing-card p-5" key={action.date}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-accent-dark">
                    Day {action.dayNumber} · {action.kind}
                  </p>
                  <time className="text-xs font-semibold text-text-tertiary">
                    {action.date}
                  </time>
                </div>
                <h3 className="mt-2 text-lg font-bold text-text-primary">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {action.detail}
                </p>
                <p className="mt-3 text-xs font-semibold text-text-tertiary">
                  Source needed: {action.asset}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
