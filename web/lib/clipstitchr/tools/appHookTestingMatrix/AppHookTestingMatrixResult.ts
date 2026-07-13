import type { AppHookTestingCell } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingCell";

export type AppHookTestingMatrixResult = {
  audience: string;
  cells: readonly AppHookTestingCell[];
  offer: string;
  stableCta: string;
};
