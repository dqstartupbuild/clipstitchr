"use client";

import Link from "next/link";
import { useState } from "react";
import type { WhatShouldIPostInput } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostInput";
import { defaultWhatShouldIPostInput } from "@/lib/clipstitchr/tools/whatShouldIPost/defaultWhatShouldIPostInput";
import { recommendWhatShouldIPost } from "@/lib/clipstitchr/tools/whatShouldIPost/recommendWhatShouldIPost";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";

export function WhatShouldIPostWorkspace() {
  const [input, setInput] = useState<WhatShouldIPostInput>(
    defaultWhatShouldIPostInput,
  );
  const result = recommendWhatShouldIPost(input);
  const nextTool = publicToolCatalog[result.nextToolKey];

  return (
    <section
      className="px-6 py-16"
      aria-label="What should I post decision tree"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:items-start">
        <div className="marketing-card grid gap-5 p-6">
          <div>
            <p className="marketing-eyebrow">Five quick choices</p>
            <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
              Start with what is true today.
            </h2>
          </div>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            What should this post do?
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  goal: event.target.value as WhatShouldIPostInput["goal"],
                })
              }
              value={input.goal}
            >
              <option value="reach">Reach new people</option>
              <option value="explain">Explain the product</option>
              <option value="convert">Support a paid decision</option>
              <option value="retain">Bring users back</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Where is the viewer now?
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  funnelStage: event.target
                    .value as WhatShouldIPostInput["funnelStage"],
                })
              }
              value={input.funnelStage}
            >
              <option value="unaware">Does not know the problem yet</option>
              <option value="problem-aware">Knows the problem</option>
              <option value="product-aware">Knows the product</option>
              <option value="customer">Already uses the product</option>
            </select>
          </label>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-bold text-text-primary">
              What can you use right now?
            </legend>
            {[
              ["app-demo", "App-demo footage"],
              ["ugc", "UGC or creator footage"],
              ["screenshots", "App screenshots"],
              ["b-roll", "Context or lifestyle clips"],
            ].map(([asset, label]) => (
              <label className="flex items-center gap-3 text-sm" key={asset}>
                <input
                  checked={input.assets.includes(asset)}
                  onChange={(event) =>
                    setInput({
                      ...input,
                      assets: event.target.checked
                        ? [...input.assets, asset]
                        : input.assets.filter((item) => item !== asset),
                    })
                  }
                  type="checkbox"
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Camera preference
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  cameraPreference: event.target
                    .value as WhatShouldIPostInput["cameraPreference"],
                })
              }
              value={input.cameraPreference}
            >
              <option value="off-camera">Stay off camera</option>
              <option value="voiceover">Voiceover is fine</option>
              <option value="on-camera">On camera is fine</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-text-primary">
            Time available
            <select
              className="h-11 rounded-lg border border-border bg-white px-3"
              onChange={(event) =>
                setInput({
                  ...input,
                  capacity: event.target
                    .value as WhatShouldIPostInput["capacity"],
                })
              }
              value={input.capacity}
            >
              <option value="quick">A quick post</option>
              <option value="standard">A focused production block</option>
              <option value="batch">A batch session</option>
            </select>
          </label>
        </div>

        <div className="marketing-card p-6" aria-live="polite">
          <p className="marketing-eyebrow">Recommended next post</p>
          <h2 className="marketing-heading mt-4 text-4xl text-text-primary">
            {result.format}
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">{result.reason}</p>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Three ways to start
          </h3>
          <ol className="mt-3 grid gap-3">
            {result.prompts.map((prompt, index) => (
              <li className="rounded-lg border border-border p-4" key={prompt}>
                <span className="font-bold text-accent-dark">{index + 1}.</span>{" "}
                {prompt}
              </li>
            ))}
          </ol>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Captures to prepare
          </h3>
          <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
            {result.captures.map((capture) => (
              <li key={capture}>• {capture}</li>
            ))}
          </ul>
          <Link
            className="mt-8 inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-bold text-white hover:bg-accent-dark"
            href={nextTool.pathname}
          >
            Continue with {nextTool.name}
          </Link>
          <p className="mt-4 text-xs leading-5 text-text-tertiary">
            This is a planning recommendation, not a finished script or a
            promise of performance.
          </p>
        </div>
      </div>
    </section>
  );
}
