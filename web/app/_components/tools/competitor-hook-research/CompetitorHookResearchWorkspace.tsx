"use client";

import { useState } from "react";
import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CompetitorHookObservation } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookObservation";
import type { CompetitorHookPattern } from "@/lib/clipstitchr/tools/competitorHookResearch/CompetitorHookPattern";
import { createEmptyCompetitorHookObservation } from "@/lib/clipstitchr/tools/competitorHookResearch/createEmptyCompetitorHookObservation";
import { defaultCompetitorHookObservations } from "@/lib/clipstitchr/tools/competitorHookResearch/defaultCompetitorHookObservations";
import { formatCompetitorHookResearchMarkdown } from "@/lib/clipstitchr/tools/competitorHookResearch/formatCompetitorHookResearchMarkdown";
import { synthesizeCompetitorHookResearch } from "@/lib/clipstitchr/tools/competitorHookResearch/synthesizeCompetitorHookResearch";

type CompetitorHookResearchWorkspaceProps = {
  hasFunctionalUnlock?: boolean;
  variant?: PublicToolGateVariant;
};

export function CompetitorHookResearchWorkspace({
  hasFunctionalUnlock = false,
  variant = "control",
}: CompetitorHookResearchWorkspaceProps) {
  const [observations, setObservations] = useState<CompetitorHookObservation[]>(
    defaultCompetitorHookObservations,
  );
  const result = synthesizeCompetitorHookResearch(observations);

  return (
    <section
      className="px-6 py-16"
      aria-label="Competitor hook research worksheet"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="grid gap-4">
          <div className="marketing-card flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <p className="marketing-eyebrow">Manual observations</p>
              <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
                Record what the ad actually shows and says.
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Up to five ads. Nothing is scraped, downloaded, or monitored.
              </p>
            </div>
            <button
              className="h-10 rounded-lg border border-border px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={observations.length >= 5}
              onClick={() =>
                setObservations([
                  ...observations,
                  createEmptyCompetitorHookObservation(observations.length),
                ])
              }
              type="button"
            >
              Add another ad
            </button>
          </div>
          {observations.map((observation, observationIndex) => (
            <fieldset
              className="marketing-card grid gap-4 p-6"
              key={observation.id}
            >
              <div className="flex items-center justify-between gap-3">
                <legend className="text-xl font-bold text-text-primary">
                  Observation {observationIndex + 1}
                </legend>
                {observations.length > 1 ? (
                  <button
                    className="text-sm font-bold text-text-secondary underline"
                    onClick={() =>
                      setObservations(
                        observations.filter(
                          (item) => item.id !== observation.id,
                        ),
                      )
                    }
                    type="button"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  Ad label
                  <input
                    className="h-11 rounded-lg border border-border bg-white px-3"
                    maxLength={60}
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? { ...item, adLabel: event.target.value }
                            : item,
                        ),
                      )
                    }
                    value={observation.adLabel}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  App or advertiser
                  <input
                    className="h-11 rounded-lg border border-border bg-white px-3"
                    maxLength={80}
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? { ...item, appName: event.target.value }
                            : item,
                        ),
                      )
                    }
                    value={observation.appName}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Exact opening words you observed
                <input
                  className="h-11 rounded-lg border border-border bg-white px-3"
                  maxLength={220}
                  onChange={(event) =>
                    setObservations(
                      observations.map((item) =>
                        item.id === observation.id
                          ? { ...item, hookWords: event.target.value }
                          : item,
                      ),
                    )
                  }
                  value={observation.hookWords}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Opening visual you observed
                <textarea
                  className="min-h-20 rounded-lg border border-border bg-white p-3"
                  maxLength={300}
                  onChange={(event) =>
                    setObservations(
                      observations.map((item) =>
                        item.id === observation.id
                          ? { ...item, openingVisual: event.target.value }
                          : item,
                      ),
                    )
                  }
                  value={observation.openingVisual}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  Structure tag
                  <select
                    className="h-11 rounded-lg border border-border bg-white px-3"
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? {
                                ...item,
                                pattern: event.target
                                  .value as CompetitorHookPattern,
                              }
                            : item,
                        ),
                      )
                    }
                    value={observation.pattern}
                  >
                    {[
                      "problem",
                      "question",
                      "demo-first",
                      "proof",
                      "contrast",
                      "list",
                      "other",
                    ].map((pattern) => (
                      <option key={pattern} value={pattern}>
                        {pattern}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  Product handoff you observed
                  <input
                    className="h-11 rounded-lg border border-border bg-white px-3"
                    maxLength={240}
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? { ...item, productHandoff: event.target.value }
                            : item,
                        ),
                      )
                    }
                    value={observation.productHandoff}
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-bold text-text-primary">
                Proof visibly shown or stated
                <input
                  className="h-11 rounded-lg border border-border bg-white px-3"
                  maxLength={240}
                  onChange={(event) =>
                    setObservations(
                      observations.map((item) =>
                        item.id === observation.id
                          ? { ...item, proofShown: event.target.value }
                          : item,
                      ),
                    )
                  }
                  value={observation.proofShown}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  Audience inference to validate
                  <textarea
                    className="min-h-20 rounded-lg border border-border bg-white p-3"
                    maxLength={300}
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? { ...item, audienceInference: event.target.value }
                            : item,
                        ),
                      )
                    }
                    value={observation.audienceInference}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-text-primary">
                  Intent inference to validate
                  <textarea
                    className="min-h-20 rounded-lg border border-border bg-white p-3"
                    maxLength={300}
                    onChange={(event) =>
                      setObservations(
                        observations.map((item) =>
                          item.id === observation.id
                            ? { ...item, intentInference: event.target.value }
                            : item,
                        ),
                      )
                    }
                    value={observation.intentInference}
                  />
                </label>
              </div>
            </fieldset>
          ))}
        </div>

        <div
          className="marketing-card p-6 lg:sticky lg:top-24"
          aria-live="polite"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="marketing-eyebrow">Research summary</p>
              <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
                {result.observationsUsed} manual observations used
              </h2>
            </div>
            <PublicToolGateActionBoundary
              hasFunctionalUnlock={hasFunctionalUnlock}
              toolKey="competitor-hook-research-worksheet"
              variant={variant}
            >
              <ResourceDownloadButton
                contents={formatCompetitorHookResearchMarkdown(result)}
                fileName="clipstitchr-competitor-hook-research.md"
                label="Download notes"
                type="text/markdown;charset=utf-8"
              />
            </PublicToolGateActionBoundary>
          </div>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Repeated pattern counts
          </h3>
          <ul className="mt-3 grid gap-2">
            {result.patternCounts.map((entry) => (
              <li
                className="rounded-lg border border-border p-3"
                key={entry.pattern}
              >
                <span className="font-bold">{entry.pattern}</span>:{" "}
                {entry.count}
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Evidence entered
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
            {result.evidence.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Inferences to validate
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
            {result.inferences.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <h3 className="mt-8 text-lg font-bold text-text-primary">
            Next research questions
          </h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-secondary">
            {result.researchQuestions.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
