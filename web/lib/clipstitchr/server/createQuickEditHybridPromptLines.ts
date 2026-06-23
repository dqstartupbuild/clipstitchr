export function createQuickEditHybridPromptLines() {
  return [
    "Use a hybrid Quick Edit model for cut suggestions.",
    "First identify candidate bad ranges from detector-style signals: silence, no words, long pause, repeated or static frames, low motion, black frames, loading text, loading spinners, and scene changes.",
    "Return detector-style ranges in quickEditSuggestions.candidates with start, end, confidence from 0 to 1, signals, reason, and short stats.",
    "Valid candidate signals are loading-text, loading-spinner, static-frame, repeated-frame, low-motion, black-frame, silence, no-words, long-pause, and scene-change.",
    "Use quickEditSuggestions.removeRanges only for candidates that clearly help and should open prefilled in the manual cut editor.",
    "Be conservative with removeRanges: prefer a slightly shorter range around the obvious dead section over cutting action, speech, proof, or payoff.",
  ];
}
