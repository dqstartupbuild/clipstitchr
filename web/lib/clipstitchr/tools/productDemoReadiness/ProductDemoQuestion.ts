import type { ProductDemoQuestionId } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoQuestionId";

export type ProductDemoQuestion = {
  id: ProductDemoQuestionId;
  prompt: string;
  target: string;
  fix: string;
  isCritical: boolean;
  allowsNotApplicable: boolean;
};
