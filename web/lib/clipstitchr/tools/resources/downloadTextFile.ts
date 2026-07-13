import { downloadBlob } from "@/lib/clipstitchr/utils/downloadBlob";

export function downloadTextFile(
  contents: string,
  fileName: string,
  type = "text/plain;charset=utf-8",
) {
  downloadBlob(new Blob([contents], { type }), fileName);
}
