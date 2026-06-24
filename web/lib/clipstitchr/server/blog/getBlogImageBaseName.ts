import { sanitizeR2KeySegment } from "@/lib/clipstitchr/server/r2/sanitizeR2KeySegment";

export function getBlogImageBaseName(sourceUrl: string) {
  try {
    const pathname = new URL(sourceUrl).pathname;
    const fileName = pathname.split("/").filter(Boolean).at(-1) ?? "image";
    const withoutExtension = fileName.replace(/\.[a-zA-Z0-9]+$/, "");

    return sanitizeR2KeySegment(withoutExtension).slice(0, 80);
  } catch {
    return "image";
  }
}
