export type WhatShouldIPostResult = {
  captures: readonly string[];
  format: string;
  nextToolKey:
    | "app-ad-shot-list-generator"
    | "app-demo-recording-checklist"
    | "app-ugc-ad-brief-template";
  prompts: readonly string[];
  reason: string;
};
