import type { PlanKey } from "@/lib/clipstitchr/billing/types/PlanKey";

export type PricingPlan = {
  key: PlanKey;
  name: string;
  price: string;
  monthlyPriceUsd: number | null;
  bestFor: string;
  products: string;
  credits: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isFeatured?: boolean;
};
