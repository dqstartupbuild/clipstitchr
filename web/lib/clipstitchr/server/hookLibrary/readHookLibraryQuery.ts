import type { CliprHookRiskLevel } from "@/lib/clipstitchr/types/CliprHookRiskLevel";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { HookLibraryQuery } from "@/lib/clipstitchr/types/HookLibraryQuery";

const purposes = new Set<CliprTextPurpose>(["clipr", "stitchr", "swipr"]);
const riskLevels = new Set<CliprHookRiskLevel>([
  "safe",
  "medium",
  "aggressive",
]);

export function readHookLibraryQuery(url: string): HookLibraryQuery {
  const searchParams = new URL(url).searchParams;
  const rawPage = Number(searchParams.get("page"));
  const purpose = searchParams.get("purpose")?.trim() as
    | CliprTextPurpose
    | undefined;
  const risk = searchParams.get("risk")?.trim() as
    | CliprHookRiskLevel
    | undefined;
  const readText = (key: string, maxLength: number) =>
    searchParams.get(key)?.trim().slice(0, maxLength) || undefined;

  return {
    category: readText("category", 80),
    page:
      Number.isSafeInteger(rawPage) && rawPage > 0
        ? Math.min(rawPage, 1_000)
        : 1,
    purpose: purpose && purposes.has(purpose) ? purpose : undefined,
    query: readText("q", 80),
    risk: risk && riskLevels.has(risk) ? risk : undefined,
    trigger: readText("trigger", 80),
  };
}
