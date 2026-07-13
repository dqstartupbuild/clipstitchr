import { pricingPlans } from "@/lib/clipstitchr/pricing/pricingPlans";
import type { ClipStitchrSavingsInput } from "@/lib/clipstitchr/tools/clipStitchrSavings/ClipStitchrSavingsInput";

const starterPlan = pricingPlans.find((plan) => plan.key === "starter");

export const defaultClipStitchrSavingsInput: ClipStitchrSavingsInput = {
  clipstitchrMonthlyPrice: starterPlan?.monthlyPriceUsd ?? 0,
  clipstitchrPlanName: starterPlan?.name ?? "Starter",
  currentEditingHoursPerCreative: 3,
  currentMonthlyCreativeCount: 12,
  currentMonthlyRevisionHours: 8,
  currentMonthlySoftwareCost: 40,
  hourlyTeamCost: 50,
  modeledEditingHoursPerCreative: 0.75,
  modeledMonthlyCreativeCount: 24,
  modeledMonthlyRevisionHours: 4,
  modeledUsedSourceClipCount: 16,
  monthlySourceFootageCost: 1_200,
  usableSourceClipCount: 20,
  usedSourceClipCount: 8,
};
