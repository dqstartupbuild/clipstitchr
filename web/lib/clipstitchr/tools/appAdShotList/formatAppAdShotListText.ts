import type { AppAdShotListResult } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListResult";

export function formatAppAdShotListText(result: AppAdShotListResult) {
  const shots = result.shots
    .map(
      (shot) =>
        `${shot.id} — ${shot.title}\nSource: ${shot.source}\nTarget length: ${shot.duration}\nFraming: ${shot.framing}\nCapture: ${shot.action}\nAudio: ${shot.audioDirection}\nPurpose: ${shot.purpose}\nHandoff: ${shot.handoff}`,
    )
    .join("\n\n");
  const checklist = result.recordingChecklist
    .map((item) => `- ${item}`)
    .join("\n");

  return `APP AD SHOT LIST — ${result.appName}\n\nOBJECTIVE\n${result.objective}\n\n${result.totalPlannedFiles} planned files · ${result.totalRecommendedTakes} recommended on-set takes\n\nCAPTURE LIST\n${shots}\n\nON-SET CHECKLIST\n${checklist}`;
}
