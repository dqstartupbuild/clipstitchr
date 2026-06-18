import { AUTOMATION_STITCHR_DAILY_LIMIT } from "../lib/clipstitchr/constants/automationStitchrGenerationLimits";

export const automationDailyLimits = {
  stitchr: AUTOMATION_STITCHR_DAILY_LIMIT,
  swapr: 1,
  clipr: 1,
  "avatar-photo": 1,
  swipr: 1,
} as const;

export const automationMaxActiveTasksPerUser = 10;

export const automationMaxTaskAttempts = 3;
