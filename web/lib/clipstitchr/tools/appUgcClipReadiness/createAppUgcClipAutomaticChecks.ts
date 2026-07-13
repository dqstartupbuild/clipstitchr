import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { getAppUgcClipRoleOption } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipRoleOption";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function createAppUgcClipAutomaticChecks(
  inspection: LocalVideoInspection,
  role: AppUgcClipRole,
): VideoCheck[] {
  const roleOption = getAppUgcClipRoleOption(role);
  const shorterEdge = Math.min(inspection.width, inspection.height);
  const isNineBySixteen = Math.abs(inspection.aspectRatio - 9 / 16) <= 0.005;
  const durationIsInRange =
    inspection.duration >= roleOption.minimumDuration &&
    inspection.duration <= roleOption.maximumDuration;
  const audioStatus = roleOption.isSpoken
    ? inspection.hasAudio && inspection.audioCanDecode
      ? "pass"
      : "fail"
    : inspection.hasAudio
      ? "warning"
      : "pass";

  return [
    {
      id: "video-playback",
      title: "Browser playback",
      status: inspection.videoCanDecode ? "pass" : "fail",
      weight: 15,
      isCritical: true,
      observed: inspection.videoCanDecode
        ? "This browser can play the primary video track."
        : "This browser cannot decode the primary video track.",
      target: "A video track the current browser can play reliably.",
      fix: inspection.videoCanDecode
        ? null
        : "Re-export with a broadly supported format such as MP4 with H.264 video.",
    },
    {
      id: "role-audio",
      title: `${roleOption.label} audio`,
      status: audioStatus,
      weight: 10,
      isCritical: roleOption.isSpoken,
      observed: roleOption.isSpoken
        ? !inspection.hasAudio
          ? "This spoken role has no audio track."
          : inspection.audioCanDecode
            ? "The spoken audio track is playable in this browser."
            : "The spoken audio track is not playable in this browser."
        : !inspection.hasAudio
          ? "No audio, which suits this silent role."
          : "This silent role contains an audio track that should be reviewed or removed.",
      target: roleOption.isSpoken
        ? "A present, playable audio track for the spoken take."
        : "No required audio for this silent source clip.",
      fix:
        audioStatus === "pass"
          ? null
          : roleOption.isSpoken
            ? "Record or export the spoken take with a playable audio track."
            : "Confirm the audio is not needed, then mute or remove it during paid production.",
    },
    {
      id: "source-resolution",
      title: "Source resolution",
      status:
        shorterEdge >= 1080 ? "pass" : shorterEdge >= 720 ? "warning" : "fail",
      weight: 10,
      isCritical: false,
      observed: `${inspection.width}×${inspection.height}`,
      target:
        "At least 1080 pixels on the shorter display edge; 720 is workable with less crop room.",
      fix:
        shorterEdge >= 1080
          ? null
          : shorterEdge >= 720
            ? "Use a higher-resolution source when possible so vertical reframing has more room."
            : "Record or export a larger source before relying on this clip for a vertical crop.",
    },
    {
      id: "vertical-shape",
      title: "Vertical source shape",
      status: isNineBySixteen ? "pass" : "warning",
      weight: 5,
      isCritical: false,
      observed: `${inspection.width}×${inspection.height} (${inspection.aspectRatio.toFixed(3)}:1)`,
      target:
        "A 9:16 source is easiest to reuse; other shapes still need a human crop review.",
      fix: isNineBySixteen
        ? null
        : "Preview a vertical crop and confirm the important subject stays inside it before production.",
    },
    {
      id: "role-duration",
      title: `${roleOption.label} planning length`,
      status: durationIsInRange ? "pass" : "warning",
      weight: 5,
      isCritical: false,
      observed: `${inspection.duration.toFixed(1)} seconds`,
      target: `${roleOption.minimumDuration}–${roleOption.maximumDuration} seconds as a reusable-clip guideline, not a platform limit.`,
      fix: durationIsInRange
        ? null
        : `Trim or record toward ${roleOption.minimumDuration}–${roleOption.maximumDuration} seconds while keeping the full useful beat.`,
    },
  ];
}
