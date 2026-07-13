import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

export const nineBySixteenVideoCheckerFaqs: ToolFaq[] = [
  {
    answer:
      "No. Media Bunny reads the file from your device, the preview uses a temporary browser URL, and both are discarded when you replace the video or leave the page.",
    question: "Does ClipStitchr upload my video to check it?",
  },
  {
    answer:
      "The checker uses ClipStitchr's durable production baseline: 9:16, strong vertical resolution, dependable browser playback, and broadly compatible media settings. It is not certification for every ad network.",
    question: "Does a Ready result guarantee every ad platform will accept it?",
  },
  {
    answer:
      "1080×1920 passes the preferred resolution check. A 720×1280 video receives a warning because it can still be workable, while anything smaller needs another export.",
    question: "What video size does the checker prefer?",
  },
  {
    answer:
      "No. This tool explains what to fix but does not convert or download a new video. ClipStitchr's paid workflow prepares source clips and turns them into finished ad variations.",
    question: "Will the checker resize or convert my video?",
  },
];
