import { describe, expect, it } from "vitest";
import { ugcMiniCourseDefinition } from "./ugcMiniCourseDefinition";

describe("ugcMiniCourseDefinition", () => {
  it("describes the confirmed 24-hour lesson sequence", () => {
    const deliveryFaq = ugcMiniCourseDefinition.faqs.find(
      (faq) => faq.question === "Is this course sent by email?",
    );

    expect(deliveryFaq?.answer).toContain("After you confirm your email");
    expect(deliveryFaq?.answer).toContain("24 hours later");
  });
});
