export type PricingPlan = {
  key: string;
  name: string;
  price: string;
  monthlyPriceUsd: number | null;
  bestFor: string;
  products: string;
  credits: string;
  storage: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isFeatured?: boolean;
};
