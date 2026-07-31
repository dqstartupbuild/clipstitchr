export function getSocialSchedulingHorizonDays() {
  const configured = Number(process.env.SOCIAL_SCHEDULING_HORIZON_DAYS ?? "90");

  if (!Number.isInteger(configured) || configured < 1 || configured > 365) {
    throw new Error(
      "SOCIAL_SCHEDULING_HORIZON_DAYS must be between 1 and 365.",
    );
  }

  return configured;
}
