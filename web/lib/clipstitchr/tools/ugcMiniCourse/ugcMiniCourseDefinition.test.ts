import { describe, expect, it } from "vitest";
import { ugcMiniCourseDefinition } from "./ugcMiniCourseDefinition";

describe("ugcMiniCourseDefinition", () => {
  it("describes the immediate workbook and optional confirmed email sequence", () => {
    const deliveryFaq = ugcMiniCourseDefinition.faqs.find(
      (faq) => faq.question === "Is this course sent by email?",
    );

    expect(deliveryFaq?.answer).toContain(
      "lessons and exercises are available here immediately",
    );
    expect(deliveryFaq?.answer).toContain("after confirming your email");
  });
});
