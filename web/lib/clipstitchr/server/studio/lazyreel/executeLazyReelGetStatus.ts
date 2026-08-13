import type { LazyReelStatusData } from "@/lib/clipstitchr/types/lazyreel/LazyReelStatusData";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { lazyReelToolKeys } from "./lazyReelToolKeys";
import { lazyReelWorkflowKeys } from "./lazyReelWorkflowKeys";

export function executeLazyReelGetStatus(): LazyReelToolResult<LazyReelStatusData> {
  const snapshot = getLazyReelCorpusSnapshot();
  const data: LazyReelStatusData = {
    capabilities: [
      "Read-only niche, format, trend, combination, and app-ad research",
      "Public example-link discovery with deterministic filtering",
      "Text-only or saved-link format teardown",
      "Deterministic ideas, hooks, and shoot briefs",
      "Breakout law, contrast, and validation inspection",
      "Deterministic anti-slop copy critique",
      "Six provider-safe companion workflow planners",
    ],
    counts: {
      analyzedVideos: snapshot.analyzedVideos.length,
      breakoutTeardowns: snapshot.teardowns.length,
      decodedVideosClaimed: snapshot.stats.decodedByPipeline ?? 0,
      exampleLinks: snapshot.examples.length,
      trendingTags: snapshot.trendingTags.length,
      visuallyAnalyzed: snapshot.visualInsights.analyzed ?? 0,
    },
    liveTools: [...lazyReelToolKeys],
    snapshotVersion: lazyReelSnapshotVersion,
    workflows: [...lazyReelWorkflowKeys],
  };

  return {
    data,
    evidence: [
      {
        detail: `${data.counts.analyzedVideos} authored archetypes, ${data.counts.exampleLinks} public links, ${data.counts.breakoutTeardowns} diagnoses, and ${data.counts.trendingTags} tag rows are directly present.`,
        kind: "observed",
        label: "Committed snapshot files",
        snapshotVersion: lazyReelSnapshotVersion,
        source: "web/vendor/lazyreel/v0_1_0/upstream/mcp/data",
      },
      {
        detail: `${data.counts.decodedVideosClaimed.toLocaleString()} decoded videos are reported by the upstream aggregate metadata.`,
        kind: "derived",
        label: "Upstream aggregate claim",
        sample: data.counts.decodedVideosClaimed,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/corpus-stats.json",
      },
    ],
    limitations: [
      "The raw decoded corpus is not vendored, so the 5,560-video aggregate claim cannot be independently rebuilt from this snapshot alone.",
      "No tool fetches arbitrary URLs, runs upstream scripts, imports the self-starting MCP server, or calls a generation provider.",
      "Workflow execution produces approved-ready plans and manifests only; it does not claim a render occurred.",
      "No environment token, token prefix, or secret status is returned.",
    ],
    links: [],
    methodology:
      "Counts come from directly parsed vendored files. Aggregate claims are labeled separately from directly countable records.",
    sections: [
      { id: "tools", items: data.liveTools, title: "Research tools" },
      { id: "workflows", items: data.workflows, title: "Companion workflows" },
      {
        id: "counts",
        items: Object.entries(data.counts).map(([label, value]) => `${label}: ${value}`),
        title: "Snapshot counts",
      },
    ],
    summary: `${data.liveTools.length} research tools and ${data.workflows.length} plan-only workflows are available from ${lazyReelSnapshotVersion}.`,
    title: "LazyReel research status",
    tool: "get_status",
  };
}
