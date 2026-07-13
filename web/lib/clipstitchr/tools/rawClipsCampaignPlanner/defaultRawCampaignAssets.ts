import type { RawCampaignAsset } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignAsset";

export const defaultRawCampaignAssets: readonly RawCampaignAsset[] = [
  {
    id: "hook-1",
    name: "Founder frustration opener",
    role: "hook",
    tags: "busy founders, speed",
  },
  {
    id: "hook-2",
    name: "Messy folder question",
    role: "hook",
    tags: "workflow, teams",
  },
  {
    id: "ugc-1",
    name: "Creator problem reaction",
    role: "ugc",
    tags: "busy founders, speed",
  },
  {
    id: "demo-1",
    name: "Batch stitch screen recording",
    role: "demo",
    tags: "speed, product",
  },
  {
    id: "demo-2",
    name: "Hook review screen recording",
    role: "demo",
    tags: "testing, product",
  },
  {
    id: "proof-1",
    name: "Time comparison card",
    role: "proof",
    tags: "speed, busy founders",
  },
  {
    id: "proof-2",
    name: "Organized output grid",
    role: "proof",
    tags: "workflow, teams",
  },
  {
    id: "cta-1",
    name: "Build your first batch",
    role: "cta",
    tags: "speed, product",
  },
  {
    id: "cta-2",
    name: "See ClipStitchr pricing",
    role: "cta",
    tags: "workflow, teams",
  },
];
