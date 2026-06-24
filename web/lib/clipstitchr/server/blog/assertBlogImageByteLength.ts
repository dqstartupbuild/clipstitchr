import { blogImageMaxBytes } from "./blogImageCopyLimits";

export function assertBlogImageByteLength(byteLength: number) {
  if (byteLength > blogImageMaxBytes) {
    throw new Error("Blog image is larger than the 10 MB limit.");
  }
}
