export type StudioStitchCaptionTimingContract = {
  readonly providerOutput: "wordTimings";
  readonly sourceTimebase: "secondsFromVoiceStart";
  readonly fitRule: "divideByTempoFactor";
  readonly phraseMaximumWords: 3;
  readonly phraseMaximumDurationSeconds: 1.1;
  readonly breakOnPunctuation: true;
  readonly cueEndPaddingSeconds: 0.05;
  readonly captionCutoffSeconds: number;
};
