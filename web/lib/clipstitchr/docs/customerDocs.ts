import { avatarsDoc } from "@/lib/clipstitchr/docs/avatarsDoc";
import { automationDoc } from "@/lib/clipstitchr/docs/automationDoc";
import { cliprDoc } from "@/lib/clipstitchr/docs/cliprDoc";
import { clipScoreDoc } from "@/lib/clipstitchr/docs/clipScoreDoc";
import { gettingStartedDoc } from "@/lib/clipstitchr/docs/gettingStartedDoc";
import { hookLabDoc } from "@/lib/clipstitchr/docs/hookLabDoc";
import { postBridgeDoc } from "@/lib/clipstitchr/docs/postBridgeDoc";
import { rateLimitsDoc } from "@/lib/clipstitchr/docs/rateLimitsDoc";
import { stitchScoreDoc } from "@/lib/clipstitchr/docs/stitchScoreDoc";
import { stitchrDoc } from "@/lib/clipstitchr/docs/stitchrDoc";
import { swaprDoc } from "@/lib/clipstitchr/docs/swaprDoc";
import { swiprDoc } from "@/lib/clipstitchr/docs/swiprDoc";
import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const customerDocs: CustomerDocPage[] = [
  gettingStartedDoc,
  stitchrDoc,
  clipScoreDoc,
  stitchScoreDoc,
  hookLabDoc,
  cliprDoc,
  swiprDoc,
  swaprDoc,
  avatarsDoc,
  automationDoc,
  postBridgeDoc,
  rateLimitsDoc,
];
