import { blogImageMaxBytes } from "./blogImageCopyLimits";

export function assertBlogImageContentLength(contentLengthHeader: string | null) {
  if (!contentLengthHeader) {
    return;
  }

  const contentLength = Number(contentLengthHeader);

  if (Number.isFinite(contentLength) && contentLength > blogImageMaxBytes) {
    throw new Error("Blog image is larger than the 10 MB limit.");
  }
}
