import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function createNineBySixteenVideoChecks(
  inspection: LocalVideoInspection,
): VideoCheck[] {
  const isNineBySixteen = Math.abs(inspection.aspectRatio - 9 / 16) <= 0.005;
  const hasPreferredResolution =
    inspection.width >= 1080 && inspection.height >= 1920;
  const hasWorkableResolution =
    inspection.width >= 720 && inspection.height >= 1280;
  const isPreferredFormat =
    inspection.mimeType.toLowerCase().startsWith("video/mp4") &&
    inspection.videoCodec === "avc";
  const hasPreferredFrameRate =
    inspection.videoFrameRate !== null &&
    inspection.videoFrameRate >= 24 &&
    inspection.videoFrameRate <= 60;
  const hasSquarePixels =
    inspection.pixelAspectRatio !== null &&
    inspection.pixelAspectRatio.num === inspection.pixelAspectRatio.den;
  const isKnownSdr = inspection.hasHighDynamicRange === false;

  return [
    {
      fix: isNineBySixteen
        ? null
        : "Reframe the demo on a 9:16 canvas before using it as a finished vertical ad.",
      id: "aspect-ratio",
      isCritical: true,
      observed: `${inspection.width}×${inspection.height} (${inspection.aspectRatio.toFixed(3)}:1)`,
      status: isNineBySixteen ? "pass" : "fail",
      target: "A 9:16 display ratio, within a small metadata tolerance.",
      title: "9:16 shape",
      weight: 30,
    },
    {
      fix: hasPreferredResolution
        ? null
        : hasWorkableResolution
          ? "Use a 1080×1920 source when you can for more room around app text and controls."
          : "Export at least 720×1280, with 1080×1920 preferred.",
      id: "resolution",
      isCritical: false,
      observed: `${inspection.width}×${inspection.height}`,
      status: hasPreferredResolution
        ? "pass"
        : hasWorkableResolution
          ? "warning"
          : "fail",
      target: "1080×1920 preferred; 720×1280 is a workable floor.",
      title: "Resolution",
      weight: 20,
    },
    {
      fix: inspection.videoCanDecode
        ? null
        : "Re-export with a broadly supported video codec such as H.264/AVC.",
      id: "video-decode",
      isCritical: true,
      observed: inspection.videoCanDecode
        ? "This browser can play the video track."
        : "This browser cannot decode the video track.",
      status: inspection.videoCanDecode ? "pass" : "fail",
      target: "A video track the current browser can decode.",
      title: "Browser playback",
      weight: 20,
    },
    {
      fix: isPreferredFormat
        ? null
        : inspection.videoCanDecode
          ? "Use an MP4 container with H.264/AVC when you need the safest handoff."
          : "Re-export as an MP4 with H.264/AVC video.",
      id: "format",
      isCritical: false,
      observed: `${inspection.mimeType.split(";")[0]} · ${inspection.videoCodecParameter ?? inspection.videoCodec ?? "unknown codec"}`,
      status: isPreferredFormat
        ? "pass"
        : inspection.videoCanDecode
          ? "warning"
          : "fail",
      target: "MP4 with H.264/AVC for a dependable production handoff.",
      title: "Container and codec",
      weight: 10,
    },
    {
      fix: hasPreferredFrameRate
        ? null
        : "Use a steady frame rate between 24 and 60 FPS when you re-export.",
      id: "frame-rate",
      isCritical: false,
      observed:
        inspection.videoFrameRate === null
          ? "Frame rate could not be estimated."
          : `${inspection.videoFrameRate.toFixed(1)} FPS`,
      status: hasPreferredFrameRate ? "pass" : "warning",
      target: "A steady estimated rate from 24 to 60 FPS.",
      title: "Frame rate",
      weight: 10,
    },
    {
      fix: !inspection.hasAudio ||
        (inspection.audioCanDecode && inspection.audioCodec === "aac")
        ? null
        : inspection.audioCanDecode
          ? "AAC audio is the safest choice when the demo needs sound."
          : "Re-export or remove the audio track so the file plays reliably.",
      id: "audio",
      isCritical: false,
      observed: !inspection.hasAudio
        ? "No audio, which is valid."
        : `${inspection.audioCodecParameter ?? inspection.audioCodec ?? "unknown audio codec"} · ${inspection.audioCanDecode ? "decodable" : "not decodable"}`,
      status: !inspection.hasAudio
        ? "pass"
        : !inspection.audioCanDecode
          ? "fail"
          : inspection.audioCodec === "aac"
            ? "pass"
            : "warning",
      target: "No audio, or a decodable AAC track when sound is needed.",
      title: "Audio track",
      weight: 5,
    },
    {
      fix:
        isKnownSdr && hasSquarePixels
          ? null
          : "Use SDR color and square pixels to reduce surprises across social video players.",
      id: "color-and-pixels",
      isCritical: false,
      observed: `${inspection.hasHighDynamicRange === null ? "HDR unknown" : inspection.hasHighDynamicRange ? "HDR" : "SDR"} · ${inspection.pixelAspectRatio ? `${inspection.pixelAspectRatio.num}:${inspection.pixelAspectRatio.den} pixels` : "pixel ratio unknown"}`,
      status: isKnownSdr && hasSquarePixels ? "pass" : "warning",
      target: "SDR color with square 1:1 pixels.",
      title: "Color and pixel shape",
      weight: 5,
    },
  ];
}
