import type { LazyReelMakeBriefData } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefData";
import type { LazyReelMakeBriefRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelMakeBriefRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { clampLazyReelLimit } from "./clampLazyReelLimit";
import { createLazyReelBriefData } from "./createLazyReelBriefData";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { readLazyReelOptionalText } from "./readLazyReelOptionalText";
import { readLazyReelRequiredText } from "./readLazyReelRequiredText";

export function executeLazyReelMakeBrief(
  request: LazyReelMakeBriefRequest,
): LazyReelToolResult<LazyReelMakeBriefData> {
  const product = readLazyReelRequiredText(request.product, "Product", 500);
  const mode = request.mode ?? "brief";
  const niche = readLazyReelOptionalText(request.niche, 200) || "your niche";
  const audience = readLazyReelOptionalText(request.audience, 500) || "the buyer";
  const objective =
    readLazyReelOptionalText(request.objective, 500) || "first qualified purchase";
  const count = clampLazyReelLimit(request.count, mode === "hooks" ? 8 : 5, mode === "hooks" ? 12 : 8);
  const data = createLazyReelBriefData({
    audience,
    count,
    framework: readLazyReelOptionalText(request.framework, 100) || undefined,
    mode,
    niche,
    objective,
    product,
  });

  return {
    data,
    evidence: [
      {
        detail: `${data.breakoutChecklist.length} opening checks come from the saved breakout model.`,
        kind: "derived",
        label: "Breakout quality gate",
        sample: data.breakoutChecklist.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/breakout-vs-dud.json",
      },
      {
        detail: "Framework, hook, angle, and awareness selections are deterministic templates seeded by the normalized brief.",
        kind: "heuristic",
        label: "Creative synthesis",
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/src/frameworks.ts and mcp/src/skills.ts semantics",
      },
    ],
    limitations: [
      "Generated hooks and dialogue are heuristic creative starting points, not observed corpus quotations or performance predictions.",
      "The engine does not inspect a brand guide, product claim substantiation, or legal restrictions unless that context is included in the input.",
      "A shoot brief still needs human claim review and product-specific proof before production.",
    ],
    links: [],
    methodology:
      "The same normalized input hashes to the same rotation through upstream framework, hook, angle, awareness, and visual-approach taxonomies.",
    sections: [
      {
        id: "hooks",
        items: data.hooks.map((item) => `${item.pattern}: ${item.text} Delivery: ${item.delivery}.`),
        title: "Hook bank",
      },
      {
        id: "concepts",
        items: data.concepts.map(
          (item) => `${item.framework}: ${item.hook} Visual: ${item.visualApproach}.`,
        ),
        title: "Concepts",
      },
      {
        id: "beats",
        items: data.beats.map(
          (item) => `${item.beat}: ${item.voiceover} Visual: ${item.broll}. Text: ${item.onScreenText}.`,
        ),
        title: "Shoot plan",
      },
      {
        id: "quality",
        items: data.breakoutChecklist,
        title: "First-three-second gate",
      },
    ],
    summary:
      mode === "ideas"
        ? `${data.concepts.length} deterministic framework-led concepts for ${product}.`
        : mode === "hooks"
          ? `${data.hooks.length} deterministic hook-pattern variations for ${product}.`
          : `A ${data.framework?.name ?? "framework-led"} shoot brief for ${product}.`,
    title: mode === "brief" ? `Shoot brief: ${product}` : `${mode}: ${product}`,
    tool: "make_brief",
  };
}
