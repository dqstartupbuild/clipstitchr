import type { LazyReelNicheReportData } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportData";
import type { LazyReelNicheReportRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelNicheReportRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { buildLazyReelAppsReportData } from "./buildLazyReelAppsReportData";
import { buildLazyReelCombosReportData } from "./buildLazyReelCombosReportData";
import { buildLazyReelFormatReportData } from "./buildLazyReelFormatReportData";
import { buildLazyReelOverviewReportData } from "./buildLazyReelOverviewReportData";
import { buildLazyReelTrendsReportData } from "./buildLazyReelTrendsReportData";
import { clampLazyReelLimit } from "./clampLazyReelLimit";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { readLazyReelOptionalText } from "./readLazyReelOptionalText";

export function executeLazyReelNicheReport(
  request: LazyReelNicheReportRequest,
): LazyReelToolResult<LazyReelNicheReportData> {
  const focus = request.focus ?? "overview";
  const niche = readLazyReelOptionalText(request.niche, 200);
  const snapshot = getLazyReelCorpusSnapshot();
  const data =
    focus === "apps"
      ? buildLazyReelAppsReportData()
      : focus === "combos"
        ? buildLazyReelCombosReportData(niche)
        : focus === "format"
          ? buildLazyReelFormatReportData(niche)
          : focus === "trends"
            ? buildLazyReelTrendsReportData(niche, clampLazyReelLimit(request.limit, 8, 18))
            : buildLazyReelOverviewReportData(niche);
  const scope = data.scope;

  return {
    data,
    evidence: [
      {
        detail: `The snapshot reports ${snapshot.stats.decodedByPipeline ?? 0} decoded videos used for aggregate lift.`,
        kind: "derived",
        label: "Contrastive corpus aggregates",
        sample: snapshot.stats.decodedByPipeline ?? 0,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/insights.json and related derived aggregates",
      },
      {
        detail: `${snapshot.examples.length} public TikTok link records are available as examples, sorted by views per follower.`,
        kind: "observed",
        label: "Example-link metadata",
        sample: snapshot.examples.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/examples.json",
      },
      {
        detail: `${snapshot.teardowns.length} author-produced breakout diagnoses are included in the snapshot.`,
        kind: "heuristic",
        label: "Editorial teardowns",
        sample: snapshot.teardowns.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/winners.json",
      },
    ],
    limitations: [
      "The vendored data contains derived aggregates and public links, not the raw 5,560-video corpus needed to reproduce every aggregate independently.",
      "Lift describes association inside this snapshot and does not prove that a creative choice caused performance.",
      "The engine never opens example links; removed, private, or changed TikTok pages may no longer match the saved metadata.",
      ...(niche && scope.includes("fallback")
        ? [`No direct ${niche} slice was available, so this result uses ${scope}.`]
        : []),
    ],
    links: data.examples.map((example) => ({
      context: `${example.niche}; ${example.viewsPerFollower}x views per follower`,
      label: `${example.videoFormat ?? "Unclassified format"} example`,
      url: example.url,
    })),
    methodology:
      focus === "format"
        ? "Vision-label aggregates compare first-three-second formats and craft attributes between creator-relative breakouts and the rest."
        : focus === "trends"
          ? "Trends pass recurrence, cross-niche transfer, and corpus-median views-per-follower gates before receiving a named formula."
          : focus === "apps"
            ? "App-ad labels are summarized with creator-relative breakout lift inside the 94-record app vertical."
            : "Hook, framework, gap, and combination claims use contrastive lift: top-quartile views per follower versus the rest, scoped to a matched niche when available.",
    sections: [
      {
        id: "signals",
        items: [
          ...data.hookLift.map((item) => `${item.label}: ${item.lift}x (${item.nWinners}/${item.nTotal})`),
          ...data.formatLift.map((item) => `${item.label}: ${item.lift}x (${item.nWinners}/${item.nTotal})`),
          ...data.craftSignals.map((item) => `${item.label}: ${item.lift}x (sample ${item.sampleSize})`),
          ...data.topAppPatterns.map((item) => `${item.label}: ${item.lift}x (winner sample ${item.sampleSize})`),
        ],
        title: "Signals",
      },
      {
        id: "opportunities",
        items: [
          ...data.opportunityPatterns.map((item) => `${item.label}: ${item.lift}x at ${item.sharePercent}% supply`),
          ...data.combinations.map((item) => `${item.label}: ${item.lift}x (${item.winners}/${item.sampleSize})`),
          ...data.trends.map((item) => `${item.name}: ${item.formula ?? "Formula unavailable"}`),
        ],
        title: "What to test",
      },
      {
        id: "examples",
        items: data.teardowns.map(
          (item) => `${item.reach}: ${item.stealThis} (${item.hookPattern})`,
        ),
        title: "Diagnosed breakouts",
      },
    ],
    summary: `${focus} research for ${scope}, grounded in the vendored ${lazyReelSnapshotVersion} snapshot.`,
    title: focus === "overview" ? `What is working in ${scope}` : `${focus} report: ${scope}`,
    tool: "niche_report",
  };
}
