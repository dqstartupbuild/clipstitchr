import type { ProductDemoAnswer } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswer";

export const productDemoAnswerOptions: Array<{
  label: string;
  value: ProductDemoAnswer;
}> = [
  { label: "Yes", value: "yes" },
  { label: "Not sure", value: "not-sure" },
  { label: "No", value: "no" },
];
