import type { ProductDemoAnswer } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswer";
import type { ProductDemoQuestionId } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoQuestionId";

export type ProductDemoAnswers = Record<
  ProductDemoQuestionId,
  ProductDemoAnswer
>;
