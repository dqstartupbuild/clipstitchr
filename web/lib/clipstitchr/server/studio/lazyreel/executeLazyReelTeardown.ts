import type { LazyReelTeardownData } from "@/lib/clipstitchr/types/lazyreel/LazyReelTeardownData";
import type { LazyReelTeardownRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelTeardownRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { createLazyReelBriefData } from "./createLazyReelBriefData";
import { filterLazyReelExamples } from "./filterLazyReelExamples";
import { findLazyReelTrend } from "./findLazyReelTrend";
import { findLazyReelVideoUrl } from "./findLazyReelVideoUrl";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { hashLazyReelInput } from "./hashLazyReelInput";
import { lazyReelHookPatterns } from "./lazyReelHookPatterns";
import { lazyReelScriptFrameworks } from "./lazyReelScriptFrameworks";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { lazyReelVideoModels } from "./lazyReelVideoModels";
import { matchesLazyReelTextFilter } from "./matchesLazyReelTextFilter";
import { pickLazyReelValue } from "./pickLazyReelValue";
import { readLazyReelOptionalText } from "./readLazyReelOptionalText";
import { readLazyReelRequiredText } from "./readLazyReelRequiredText";

export function executeLazyReelTeardown(
  request: LazyReelTeardownRequest,
): LazyReelToolResult<LazyReelTeardownData> {
  const video = readLazyReelOptionalText(request.video, 20_000);

  if (video) {
    const snapshot = getLazyReelCorpusSnapshot();
    const videoUrl = findLazyReelVideoUrl(video);
    const inputIsUrl = /^https?:\/\//iu.test(video);
    const sourceMatch = videoUrl
      ? snapshot.examples.find((example) => example.url === videoUrl) ?? null
      : null;
    const seed = hashLazyReelInput(video);
    const framework = sourceMatch
      ? lazyReelScriptFrameworks.find((item) =>
          matchesLazyReelTextFilter(item.name, sourceMatch.framework),
        ) ?? pickLazyReelValue(lazyReelScriptFrameworks, seed)
      : pickLazyReelValue(lazyReelScriptFrameworks, seed);
    const hook = sourceMatch
      ? lazyReelHookPatterns.find((item) =>
          matchesLazyReelTextFilter(item.name, sourceMatch.hookPattern),
        ) ?? pickLazyReelValue(lazyReelHookPatterns, seed + 1)
      : pickLazyReelValue(lazyReelHookPatterns, seed + 1);
    const data: LazyReelTeardownData = {
      confidence: sourceMatch ? "medium" : inputIsUrl ? "low" : "medium",
      input: video,
      mode: "video",
      narrative: {
        framework: framework.name,
        hookPattern: hook.name,
        orderedBeats: [...framework.beats],
      },
      replication: [
        `Keep the ${framework.name} story order: ${framework.beats.join(" then ")}.`,
        `Use the ${hook.name} opening shape without copying the original creative treatment.`,
        "Identify the one signature device from supplied frames or transcript before writing generation prompts.",
        "Map every claimed craft detail to something actually present in the supplied description, transcript, or frames.",
      ],
      sourceMatch: sourceMatch
        ? {
            framework: sourceMatch.framework,
            hookPattern: sourceMatch.hookPattern,
            niche: sourceMatch.niche,
            url: sourceMatch.url,
            videoFormat: sourceMatch.videoFormat,
            views: sourceMatch.views,
            viewsPerFollower: sourceMatch.viewsPerFollower,
          }
        : null,
    };

    return {
      data,
      evidence: [
        {
          detail: sourceMatch
            ? "The exact supplied TikTok URL matches saved example metadata."
            : "The framework and hook classification are a deterministic best-fit heuristic over the supplied text.",
          kind: sourceMatch ? "observed" : "heuristic",
          label: sourceMatch ? "Saved URL match" : "Text-only best fit",
          sample: sourceMatch ? 1 : undefined,
          snapshotVersion: lazyReelSnapshotVersion,
          source: sourceMatch ? "mcp/data/examples.json" : "mcp/src/frameworks.ts semantics",
        },
      ],
      limitations: [
        "The engine does not fetch or inspect the supplied URL.",
        "Without user-supplied frames, transcript, or a saved exact-link match, visual craft, audio, retention, and signature-device claims cannot be verified.",
        "A URL alone therefore produces low-confidence planning guidance, not a factual video teardown.",
      ],
      links: sourceMatch
        ? [{ context: "Exact saved example match", label: "Supplied video", url: sourceMatch.url }]
        : [],
      methodology:
        "Exact saved URLs reuse observed metadata. Other inputs receive a deterministic best-fit framework and hook skeleton without inventing URL content.",
      sections: [
        {
          id: "narrative",
          items: [
            `Framework: ${data.narrative.framework}`,
            `Hook: ${data.narrative.hookPattern}`,
            `Beats: ${data.narrative.orderedBeats.join(" then ")}`,
          ],
          title: "Narrative DNA",
        },
        { id: "replication", items: data.replication, title: "Replication plan" },
      ],
      summary: sourceMatch
        ? "The URL matches saved metadata; live craft remains uninspected."
        : "A text-only structural hypothesis with explicit low-confidence craft limits.",
      title: "Format teardown",
      tool: "teardown",
    };
  }

  const product = readLazyReelRequiredText(request.product ?? "", "Product", 500);
  const niche = readLazyReelOptionalText(request.niche, 200) || "your niche";
  const trendName = readLazyReelOptionalText(request.trend, 300);
  const snapshot = getLazyReelCorpusSnapshot();
  const trend = findLazyReelTrend(snapshot.trends, { niche, trend: trendName });
  if (!trend) {
    throw new TypeError("No trend records are available in the LazyReel snapshot.");
  }
  const model =
    lazyReelVideoModels.find((item) => item.id === (request.model ?? "seedance")) ??
    lazyReelVideoModels[0];
  const exampleMatches = filterLazyReelExamples(snapshot.examples, {
    hookPattern: trend.hookPattern,
    niche,
    videoFormat: trend.videoFormat,
  });
  const fallbackMatches = exampleMatches.length
    ? exampleMatches
    : filterLazyReelExamples(snapshot.examples, {
        hookPattern: trend.hookPattern,
        videoFormat: trend.videoFormat,
      });
  const brief = createLazyReelBriefData({
    audience: `${niche} buyer`,
    count: 3,
    framework: trend.framework,
    mode: "brief",
    niche,
    objective: "first purchase",
    product,
  });
  const data: LazyReelTeardownData = {
    brief: {
      angle: brief.angle?.name ?? "Hold and show",
      beats: brief.beats,
      framework: brief.framework?.name ?? trend.framework,
      hooks: brief.hooks.map((item) => item.text),
    },
    examples: fallbackMatches.slice(0, 3).map((item) => item.url),
    mode: "product",
    model: { id: model.id, name: model.name, notes: [...model.notes], promptGrammar: model.promptGrammar },
    niche,
    product,
    trend: {
      formula: trend.formula,
      name: trend.name,
      videoFormat: trend.videoFormat,
      whyItTravels: trend.whyItTravels,
    },
  };

  return {
    data,
    evidence: [
      {
        detail: `${trend.name} passed the snapshot's recurrence, transfer, and performance gates.`,
        kind: "derived",
        label: "Validated trend cluster",
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/trends.json",
      },
      {
        detail: `${data.examples.length} saved public examples match the trend format and hook after niche fallback.`,
        kind: "observed",
        label: "Example links",
        sample: data.examples.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/examples.json",
      },
      {
        detail: "The product brief and model scaffold are deterministic template synthesis.",
        kind: "heuristic",
        label: "Replication plan",
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/src/skills.ts replicateFormat semantics",
      },
    ],
    limitations: [
      "The plan does not render video, call a provider, inspect examples, or claim the selected model will preserve every product detail.",
      "Trend transfer is directional evidence; it does not guarantee performance for this product.",
      "Generation prompts require human claim review and reference-image preparation before provider execution.",
    ],
    links: fallbackMatches.slice(0, 3).map((item) => ({
      context: `${item.videoFormat}; ${item.hookPattern}; ${item.viewsPerFollower}x reach`,
      label: "Study this format",
      url: item.url,
    })),
    methodology:
      "Select an explicitly named trend when possible, otherwise the first cross-niche trend transferable to the niche; attach matching public examples, a deterministic brief, and the chosen upstream model grammar.",
    sections: [
      { id: "format", items: [trend.formula ?? trend.name, trend.whyItTravels ?? "Transfer rationale unavailable"], title: "Format to copy" },
      { id: "brief", items: data.brief.beats.map((item) => `${item.beat}: ${item.voiceover} Visual: ${item.broll}.`), title: "Shoot plan" },
      { id: "model", items: [data.model.promptGrammar, ...data.model.notes], title: `Prepare for ${data.model.name}` },
    ],
    summary: `A ${trend.videoFormat} replication plan for ${product}, based on ${trend.name}.`,
    title: `Replicate: ${trend.name}`,
    tool: "teardown",
  };
}
