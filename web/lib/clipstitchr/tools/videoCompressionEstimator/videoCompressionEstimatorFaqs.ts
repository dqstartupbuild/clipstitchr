import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const videoCompressionEstimatorFaqs: ToolFaq[] = [
  {
    answer:
      "No. It estimates a likely size from duration and your selected video and audio bitrates. Different encoders and containers can land outside the shown eight-percent planning range.",
    question: "Will the final file be exactly this size?",
  },
  {
    answer:
      "No. A selected video is read only on your device to fill in duration and original size. The tool never uploads, changes, or saves the file.",
    question: "Does this tool compress my video?",
  },
  {
    answer:
      "Choose a file for local facts or enter duration and original size yourself. Then adjust the bitrates and your upload speed to compare a planning scenario.",
    question: "What should I enter?",
  },
];
