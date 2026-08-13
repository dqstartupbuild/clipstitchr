import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import type { StudioClipsExecutionAvailability } from "@/lib/clipstitchr/types/studioClips/StudioClipsExecutionAvailability";

const fontIds = [
  "Anton-Regular",
  "ArchivoBlack-Regular",
  "Bangers-Regular",
  "BarlowCondensed-Bold",
  "BebasNeue-Regular",
  "DMSans",
  "Inter",
  "LeagueSpartan",
  "Montserrat-Variable-wght",
  "NunitoSans",
  "OpenSans",
  "Oswald-Variable-wght",
  "Poppins-ExtraBold",
  "Raleway-Variable-wght",
  "Roboto",
  "Rubik",
  "Sora",
  "THEBOLDFONT",
  "TikTokSans-Regular",
  "Urbanist",
  "WorkSans",
] as const;

export function getStudioClipsCapabilities(
  productId: string,
  execution: StudioClipsExecutionAvailability,
): StudioClipsCapabilities {
  return {
    analysis: {
      message:
        execution.state === "available"
          ? "Transcript excerpts, candidates, scores, and reasoning appear as the worker finishes analysis."
          : "Transcript excerpts, candidates, scores, and reasoning need the Studio Clips worker.",
      state: execution.state === "available" ? "available" : "unavailable",
    },
    captionStyle: {
      builtInFonts: fontIds.map((id) => ({
        displayName: id.replace(/-(?:Regular|Bold|ExtraBold|Variable-wght)$/u, "").replaceAll("-", " "),
        id,
      })),
      customFontUpload: {
        message:
          "Upload a TrueType or OpenType font under 10 MB for this task.",
        state: "available",
      },
      execution: "rendered",
      fontSizeOptionsPx: [18, 28, 40],
      templates: [
        {
          description: "Bold white captions with a strong black outline",
          fontColorHex: "#FFFFFF",
          fontFamily: "THEBOLDFONT",
          fontSizePx: 32,
          id: "default",
          name: "Default",
        },
        {
          description: "Large white captions with a heavy black outline",
          fontColorHex: "#FFFFFF",
          fontFamily: "THEBOLDFONT",
          fontSizePx: 38,
          id: "hormozi",
          name: "Hormozi",
        },
        {
          description: "Large yellow captions with a heavy black outline",
          fontColorHex: "#FFFF00",
          fontFamily: "THEBOLDFONT",
          fontSizePx: 42,
          id: "mrbeast",
          name: "MrBeast",
        },
        {
          description: "Clean, subtle captions with a soft background",
          fontColorHex: "#FFFFFF",
          fontFamily: "TikTokSans-Regular",
          fontSizePx: 26,
          id: "minimal",
          name: "Minimal",
        },
        {
          description: "Clean white captions with a dark outline",
          fontColorHex: "#FFFFFF",
          fontFamily: "TikTokSans-Regular",
          fontSizePx: 34,
          id: "tiktok",
          name: "TikTok",
        },
        {
          description: "Cyan captions with a dark blue outline",
          fontColorHex: "#00FFFF",
          fontFamily: "THEBOLDFONT",
          fontSizePx: 36,
          id: "neon",
          name: "Neon",
        },
        {
          description: "Professional podcast-style captions",
          fontColorHex: "#FFFFFF",
          fontFamily: "TikTokSans-Regular",
          fontSizePx: 28,
          id: "podcast",
          name: "Podcast",
        },
      ],
    },
    execution,
    handoffs: {
      editor: {
        message:
          "Accepted outputs save once to the active Product Library, then open as a populated editor source.",
        state: "available",
      },
      library: {
        message:
          "Accepted outputs save as durable UGC clips in the active Product Library.",
        state: "available",
      },
      stitchr: {
        message:
          "Accepted outputs save once to the active Product Library, then open preselected in Studio Stitch.",
        state: "available",
      },
    },
    limitations: [
      execution.state === "available"
        ? "Studio Clips runs in a separate worker and can take several minutes."
        : "The Studio Clips worker is not enabled in this environment.",
      "Trim, split, ordered merge, caption restyles, Product styling, clean rerenders, and platform exports create immutable render revisions when the worker is available.",
      "Free-text regeneration directions need a future edit-planning provider; deterministic regeneration without directions is available now.",
      "Caption restyles need a clean master and saved caption timing. Older burned-caption outputs return a clear unavailable result instead of stacking captions.",
      "No arbitrary URL is fetched; recognized YouTube links are canonicalized and the worker enforces fixed-host redirects.",
      "Deleting a task archives its records and does not delete durable media objects.",
    ],
    outputFormats: [
      { id: "source", label: "Original framing", state: "available" },
      { id: "vertical", label: "Vertical 9:16", state: "available" },
      {
        id: "vertical_pan",
        label: "Vertical face tracking",
        message: "The supplied worker claim does not expose a face-tracking mode.",
        state: "unavailable",
      },
      {
        id: "split_screen",
        label: "Split screen",
        message: "Split editing creates separate outputs; split-screen composition is unavailable.",
        state: "unavailable",
      },
    ],
    outputMetadata: {
      message:
        execution.state === "available"
          ? "Finished outputs include verified file, duration, dimensions, codec, and audio facts."
          : "Verified output facts appear after the Studio Clips worker finishes.",
      state: execution.state === "available" ? "available" : "unavailable",
    },
    platformExports: [
      {
        id: "tiktok",
        label: "TikTok",
        state: execution.state === "available" ? "available" : "unavailable",
      },
      {
        id: "instagram_reels",
        label: "Instagram Reels",
        state: execution.state === "available" ? "available" : "unavailable",
      },
      {
        id: "youtube_shorts",
        label: "YouTube Shorts",
        state: execution.state === "available" ? "available" : "unavailable",
      },
    ],
    productId,
    schemaVersion: "studio-clips-capabilities-v1",
    sourceSnapshotVersion: "supoclip-v0_1_0",
    sources: {
      upload: {
        state: "available",
        uploadEndpoint: "/api/studio/r2/upload-url",
      },
      youtube: { state: "available" },
    },
  };
}
