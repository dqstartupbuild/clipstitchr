import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { StitchrHookOption } from "@/lib/clipstitchr/types/StitchrHookOption";
import { getStitchrHookTextIsUsable } from "@/lib/clipstitchr/server/getStitchrHookTextIsUsable";
import { sanitizeGeneratedShortFormText } from "@/lib/clipstitchr/utils/sanitizeGeneratedShortFormText";

export function normalizeStitchrHookOptions({
  candidates,
  fallbackCaption,
  filledHook,
  selectedTemplate,
  value,
}: {
  candidates: CliprHookTemplate[];
  fallbackCaption: string;
  filledHook: string;
  selectedTemplate: CliprHookTemplate;
  value: unknown;
}): StitchrHookOption[] {
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const rawOptions = Array.isArray(value) ? value : [];
  const normalizedOptions = rawOptions.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const option = entry as Record<string, unknown>;
    const templateId =
      typeof option.templateId === "string" &&
      candidateIds.has(option.templateId)
        ? option.templateId
        : "";
    const text = sanitizeGeneratedShortFormText({
      fallback: "",
      maxLength: 140,
      text: typeof option.text === "string" ? option.text : "",
    });
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (
      !templateId ||
      wordCount < 2 ||
      wordCount > 14 ||
      /{{|}}|\b[a-z]+_[a-z_]+\b/.test(text) ||
      !getStitchrHookTextIsUsable(text)
    ) {
      return [];
    }

    const angle = sanitizeGeneratedShortFormText({
      fallback: "Another angle",
      maxLength: 40,
      text: typeof option.angle === "string" ? option.angle : "",
    });
    const caption = sanitizeGeneratedShortFormText({
      fallback: fallbackCaption,
      maxLength: 500,
      text: typeof option.caption === "string" ? option.caption : "",
    });

    return [{ angle, caption, socialCaption: "", templateId, text }];
  });
  const uniqueOptions = normalizedOptions.filter(
    (option, index, options) =>
      options.findIndex(
        (candidate) =>
          candidate.text.toLowerCase() === option.text.toLowerCase(),
      ) === index,
  );
  const winningOption = uniqueOptions.find(
    (option) => option.text.toLowerCase() === filledHook.toLowerCase(),
  ) ?? {
    angle: "Best match",
    caption: fallbackCaption,
    socialCaption: "",
    templateId: selectedTemplate.id,
    text: filledHook,
  };

  return [
    winningOption,
    ...uniqueOptions.filter(
      (option) => option.text.toLowerCase() !== filledHook.toLowerCase(),
    ),
  ].slice(0, 3);
}
