import type { HookVisualPreferredOpening } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualPreferredOpening";

export type HookVisualMatchmakerInput = {
  appContext: string;
  audience: string;
  demoMoment: string;
  desiredAction: string;
  hook: string;
  preferredOpening: HookVisualPreferredOpening;
  ugcFootage: string;
};
