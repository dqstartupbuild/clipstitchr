import type { LazyReelKillTheSlopData } from "@/lib/clipstitchr/types/lazyreel/LazyReelKillTheSlopData";
import type { LazyReelKillTheSlopRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelKillTheSlopRequest";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { fillLazyReelHook } from "./fillLazyReelHook";
import { getLazyReelBreakoutChecklist } from "./getLazyReelBreakoutChecklist";
import { hashLazyReelInput } from "./hashLazyReelInput";
import { lazyReelBannedWords } from "./lazyReelBannedWords";
import { lazyReelHookPatterns } from "./lazyReelHookPatterns";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";
import { lazyReelVoiceRules } from "./lazyReelVoiceRules";
import { pickLazyReelValue } from "./pickLazyReelValue";
import { readLazyReelRequiredText } from "./readLazyReelRequiredText";

export function executeLazyReelKillTheSlop(
  request: LazyReelKillTheSlopRequest,
): LazyReelToolResult<LazyReelKillTheSlopData> {
  const copy = readLazyReelRequiredText(request.copy, "Copy", 20_000);
  const normalizedCopy = copy.toLocaleLowerCase();
  const banned = lazyReelBannedWords.filter((word) => normalizedCopy.includes(word));
  const problems: string[] = [];

  if (banned.length) {
    problems.push(`AI-tell vocabulary: ${banned.join(", ")}.`);
  }
  if (/\b(we|our|us)\b/iu.test(copy) && !/\byou\b/iu.test(copy)) {
    problems.push("Brand-centric: the copy speaks about the brand without speaking to the buyer.");
  }
  if (!/[0-9]/u.test(copy)) {
    problems.push("No specificity: there is no concrete number, timeline, or measured detail.");
  }
  if (/[🚀✨🔥💯]/u.test(copy)) {
    problems.push("Hype emoji: the decoration substitutes for a concrete claim.");
  }
  if (copy.length < 120 && !/\?/u.test(copy) && !/\b(pov|how|why)\b/iu.test(copy)) {
    problems.push("No curiosity gap: nothing requires the viewer to keep watching.");
  }
  if (/\b(honest review|review|tutorial|how to use|unboxing|#ad|paid partnership|sponsored)\b/iu.test(copy)) {
    problems.push("Format signal: the opening announces the ad or tutorial instead of creating a visual question.");
  }
  if (!problems.length) {
    problems.push("The copy clears the mechanical checks, but it still needs a concrete proof point before production.");
  }

  const pattern = pickLazyReelValue(lazyReelHookPatterns, hashLazyReelInput(copy));
  const rewrite = fillLazyReelHook(pattern.template, {
    audience: "you",
    category: "product",
    niche: "your niche",
    product: "this",
  });
  const data: LazyReelKillTheSlopData = {
    breakoutChecklist: getLazyReelBreakoutChecklist(),
    hookPattern: pattern.name,
    original: copy,
    problems,
    rewrite,
    voiceRules: lazyReelVoiceRules.slice(0, 5),
  };

  return {
    data,
    evidence: [
      {
        detail: "The audit checks the upstream banned-word list, customer/brand pronouns, concrete detail, hype emoji, curiosity, and explicit format labels.",
        kind: "heuristic",
        label: "Anti-slop audit",
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/src/frameworks.ts and mcp/src/skills.ts killTheSlop semantics",
      },
      {
        detail: `${data.breakoutChecklist.length} opening checks are attached to the rewrite for human review.`,
        kind: "derived",
        label: "Opening quality gate",
        sample: data.breakoutChecklist.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/breakout-vs-dud.json",
      },
    ],
    limitations: [
      "The critique is a deterministic lexical and structural heuristic; it does not understand every brand voice or regulated claim.",
      "The rewrite intentionally uses a generic product placeholder because the tool receives copy, not verified product facts.",
      "Human review must replace generic placeholders with truthful, substantiated specifics.",
    ],
    links: [],
    methodology:
      "A bounded rule set identifies known failure modes, then a stable input hash selects one upstream hook pattern for a repeatable rewrite.",
    sections: [
      { id: "problems", items: problems, title: "What is weak" },
      { id: "rewrite", items: [rewrite], title: `Rewrite: ${pattern.name}` },
      { id: "quality", items: data.breakoutChecklist, title: "Opening review" },
    ],
    summary: `${problems.length} issue${problems.length === 1 ? "" : "s"} identified; rewritten with the ${pattern.name} pattern.`,
    title: "Copy audit",
    tool: "kill_the_slop",
  };
}
