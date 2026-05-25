import { avatarsDoc } from "@/lib/clipstitchr/docs/avatarsDoc";
import { cliprDoc } from "@/lib/clipstitchr/docs/cliprDoc";
import { gettingStartedDoc } from "@/lib/clipstitchr/docs/gettingStartedDoc";
import { rateLimitsDoc } from "@/lib/clipstitchr/docs/rateLimitsDoc";
import { stitchrDoc } from "@/lib/clipstitchr/docs/stitchrDoc";
import { swaprDoc } from "@/lib/clipstitchr/docs/swaprDoc";
import { swiprDoc } from "@/lib/clipstitchr/docs/swiprDoc";
import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const customerDocs: CustomerDocPage[] = [
  gettingStartedDoc,
  stitchrDoc,
  cliprDoc,
  swiprDoc,
  swaprDoc,
  avatarsDoc,
  rateLimitsDoc,
];
