import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";

export function getCliprContentTypeUsesTextOverlay(
  contentType: CliprContentType,
) {
  return (
    contentType === "text-shot" ||
    contentType === "product-video" ||
    contentType === "value-video" ||
    contentType === "problem-solution" ||
    contentType === "objection-handler" ||
    contentType === "how-to" ||
    contentType === "soft-cta"
  );
}
