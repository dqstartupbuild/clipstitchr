import { isPlanKey } from "@/lib/clipstitchr/billing/isPlanKey";

export function getPlanKeyFromSearchParam(
  value: string | string[] | undefined,
) {
  return typeof value === "string" && isPlanKey(value) ? value : undefined;
}
