import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";
import type { ProductDemoUse } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUse";
import { productDemoQuestions } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoQuestions";
import { productDemoUseOptions } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoUseOptions";

export function createProductDemoReadinessChecks({
  answers,
  inspection,
  use,
}: {
  answers: ProductDemoAnswers;
  inspection: LocalVideoInspection;
  use: ProductDemoUse;
}): VideoCheck[] {
  const useOption =
    productDemoUseOptions.find((option) => option.value === use) ??
    productDemoUseOptions[0];
  const durationIsInPlanningRange =
    inspection.duration >= useOption.minimumDuration &&
    inspection.duration <= useOption.maximumDuration;
  const hasReadableResolution =
    Math.min(inspection.width, inspection.height) >= 720;
  const automaticChecks: VideoCheck[] = [
    {
      fix: inspection.videoCanDecode
        ? null
        : "Re-export with a broadly supported format such as MP4 with H.264 video.",
      id: "video-playback",
      isCritical: true,
      observed: inspection.videoCanDecode
        ? "This browser can play the primary video track."
        : "This browser cannot decode the primary video track.",
      status: inspection.videoCanDecode ? "pass" : "fail",
      target: "A demo the current browser can play reliably.",
      title: "Video playback",
      weight: 15,
    },
    {
      fix: hasReadableResolution
        ? null
        : "Record or export a larger source before checking interface readability again.",
      id: "source-resolution",
      isCritical: false,
      observed: `${inspection.width}×${inspection.height}`,
      status: hasReadableResolution ? "pass" : "warning",
      target: "At least 720 pixels on the shorter display edge.",
      title: "Source resolution",
      weight: 5,
    },
    {
      fix:
        inspection.hasAudio && !inspection.audioCanDecode
          ? "Re-export or remove the audio track, then play the demo through once more."
          : null,
      id: "audio-playback",
      isCritical: false,
      observed: !inspection.hasAudio
        ? "No audio, which is valid."
        : inspection.audioCanDecode
          ? "The audio track is playable in this browser."
          : "The audio track is not playable in this browser.",
      status:
        inspection.hasAudio && !inspection.audioCanDecode ? "fail" : "pass",
      target: "No audio, or audio the current browser can play.",
      title: "Audio playback",
      weight: 5,
    },
    {
      fix: durationIsInPlanningRange
        ? null
        : `For this first test, tighten or expand the story toward ${useOption.minimumDuration}–${useOption.maximumDuration} seconds.`,
      id: "planning-length",
      isCritical: false,
      observed: `${inspection.duration.toFixed(1)} seconds`,
      status: durationIsInPlanningRange ? "pass" : "warning",
      target: `${useOption.minimumDuration}–${useOption.maximumDuration} seconds as a planning guideline for a ${useOption.label.toLowerCase()}, not a platform limit.`,
      title: "Planning length",
      weight: 5,
    },
  ];
  const answerChecks: VideoCheck[] = productDemoQuestions.map((question) => {
    const answer = answers[question.id];
    const isNotApplicable =
      answer === "not-applicable" && question.allowsNotApplicable;

    return {
      fix: answer === "yes" || isNotApplicable ? null : question.fix,
      id: question.id,
      isCritical: question.isCritical,
      observed: isNotApplicable
        ? "Not applicable to this demo."
        : answer === "yes"
          ? "Yes"
          : answer === "no"
            ? "No"
            : "Not sure yet",
      status: isNotApplicable
        ? "pass"
        : answer === "yes"
          ? "pass"
          : answer === "no"
            ? "fail"
            : "warning",
      target: question.target,
      title: question.prompt,
      weight: isNotApplicable ? 0 : 10,
    };
  });

  return [...automaticChecks, ...answerChecks];
}
