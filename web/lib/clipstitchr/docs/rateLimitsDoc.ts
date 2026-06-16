import type { CustomerDocPage } from "@/lib/clipstitchr/docs/CustomerDocPage";

export const rateLimitsDoc = {
  slug: "rate-limits",
  title: "Rate Limits",
  description:
    "The current usage limits for uploads, downloads, generation, and library actions.",
  summary:
    "See how often you can run common actions before ClipStitchr asks you to wait.",
  category: "limits",
  order: 100,
  updated: "2026-05-13",
  sections: [
    {
      title: "Why limits exist",
      body: [
        "Some actions do real work: uploading files, saving library items, downloading media, or generating new images and videos. Limits keep those actions reliable for everyone.",
        "These are not pricing tiers. They are current safety limits while ClipStitchr is still shaping plan details.",
      ],
    },
    {
      title: "What happens when a limit is reached",
      body: [
        "If you hit a limit, ClipStitchr stops the action before starting the work. Wait for the retry time, then run the action again.",
      ],
    },
    {
      title: "Local browser work",
      body: [
        "Some work happens in your browser and does not need a separate limit. For example, Swipr can render your saved carousel into image slides locally.",
        "Clipr and Stitchr music export also renders locally when you download a video with music enabled. Generating or regenerating the music still uses the limits below.",
        "Stitchr Longr-mode export happens locally in your browser, but saving the finished Stitch still uses upload and library-save limits.",
        "Saving, uploading, downloading, or generating content still uses the limits below because those actions use shared app resources.",
      ],
    },
  ],
  rateLimitGroups: [
    {
      title: "Uploads, Downloads, and Batch Size",
      rows: [
        {
          action: "Upload requests",
          limit: "2,000 per hour; up to 500 at once",
          note: "Applies before an upload starts.",
        },
        {
          action: "Upload data",
          limit: "10 GB per day and 500 GB per 30 days",
          note: "Based on the file sizes you upload.",
        },
        {
          action: "Download requests",
          limit: "5,000 per hour; up to 1,000 at once",
        },
        {
          action: "Delete requests",
          limit: "2,000 objects per hour; up to 500 at once",
        },
        {
          action: "Photo upload batch",
          limit: "100 files at once",
          note: "Photo expansion is 1 file at once.",
        },
        {
          action: "Video upload batch",
          limit: "20 files at once",
        },
        {
          action: "Stitchr UGC selection",
          limit: "20 UGC per batch",
          note: "Each selected UGC creates one finished stitch with the selected demo.",
        },
        {
          action: "Stitchr Longr-mode duration",
          limit: "5 minutes",
          note: "Applies to the combined selected clips before creating the Stitch.",
        },
      ],
    },
    {
      title: "AI Analysis and Generation",
      rows: [
        {
          action: "Photo and preview descriptions",
          limit: "300 per hour and 10,000 per 30 days",
          note: "Used to describe photos and image previews.",
        },
        {
          action: "Video descriptions",
          limit: "60 per hour and 1,500 per 30 days",
          note: "Used to describe what happens in UGC and demo clips.",
        },
        {
          action: "Swapr photo expansion",
          limit: "10 per hour, 20 per day, and 375 per 30 days",
        },
        {
          action: "Swapr video jobs",
          limit: "2 per hour, 5 per day, and 500 estimated output seconds per 30 days",
        },
        {
          action: "Avatar photo generation",
          limit: "15 generated images per hour, 25 per day, and 500 per 30 days",
        },
        {
          action: "Swipr AI background generation",
          limit: "20 images per hour, 50 per day, and 500 per 30 days",
        },
        {
          action: "Product setting help",
          limit: "100 per hour and 2,000 per 30 days",
          note: "Used when you create or edit product settings.",
        },
        {
          action: "Clipr jobs",
          limit: "3 per hour, 8 per day, and 900 generated seconds per 30 days",
        },
        {
          action: "Clipr, Swipr, or Stitchr text drafts",
          limit: "30 per hour",
          note: "Also applies to Swipr and Stitchr text drafts.",
        },
        {
          action: "Clipr avatar preview images",
          limit: "20 images per hour",
        },
        {
          action: "Clipr avatar video and voice",
          limit: "600 estimated avatar seconds per hour",
        },
        {
          action: "Music uploads",
          limit: "30 MB per track plus normal upload limits",
          note: "Uploaded music is shared with the whole music pool.",
        },
      ],
    },
    {
      title: "Jobs and Library Records",
      rows: [
        {
          action: "Swapr or Clipr status checks",
          limit: "600 per minute; up to 150 at once",
        },
        {
          action: "Canceling Swapr or Clipr generation",
          limit: "100 per hour; up to 20 at once",
        },
        {
          action: "Swapr output viewing",
          limit: "1,000 per hour; up to 200 at once",
        },
        {
          action: "Library saves",
          limit: "3,000 per hour; up to 500 at once",
        },
        {
          action: "Library edits",
          limit: "5,000 per hour; up to 1,000 at once",
        },
        {
          action: "Poster updates",
          limit: "1,000 per hour; up to 300 at once",
        },
        {
          action: "Library deletes",
          limit: "2,000 per hour; up to 500 at once",
        },
        {
          action: "Avatar delete",
          limit: "100 per hour; up to 20 at once",
          note: "Covers one confirmed avatar delete and its photos.",
        },
      ],
    },
  ],
} satisfies CustomerDocPage;
