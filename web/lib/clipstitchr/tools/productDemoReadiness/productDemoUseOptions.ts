import type { ProductDemoUseOption } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoUseOption";

export const productDemoUseOptions: ProductDemoUseOption[] = [
  {
    description: "A tight product moment inside a paid short-form creative.",
    label: "Short-form ad",
    maximumDuration: 30,
    minimumDuration: 6,
    value: "short-form-ad",
  },
  {
    description: "A focused demo shared as an organic social post.",
    label: "Organic post",
    maximumDuration: 60,
    minimumDuration: 6,
    value: "organic-post",
  },
  {
    description: "A little more room to explain the product on a web page.",
    label: "Landing page",
    maximumDuration: 90,
    minimumDuration: 15,
    value: "landing-page",
  },
];
