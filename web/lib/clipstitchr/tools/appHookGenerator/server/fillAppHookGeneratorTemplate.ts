import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import type { RawCliprHookTemplate } from "@/lib/clipstitchr/types/RawCliprHookTemplate";
import { getAppHookGeneratorTemplateFillers } from "@/lib/clipstitchr/tools/appHookGenerator/server/getAppHookGeneratorTemplateFillers";

export function fillAppHookGeneratorTemplate(
  template: RawCliprHookTemplate,
  input: AppHookGeneratorRequest,
) {
  const fillers = getAppHookGeneratorTemplateFillers(template, input);
  const text = template.template.replace(
    /{{([a-z0-9_]+)}}/gi,
    (_, key: string) => {
      const filler = fillers[key as keyof typeof fillers];

      if (typeof filler !== "string") {
        throw new Error("App Hook Generator catalog is incomplete.");
      }

      return filler;
    },
  );

  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trim()
    .slice(0, 220);
}
