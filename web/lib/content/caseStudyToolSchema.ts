import { z } from "zod";

const caseStudyToolUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//.test(value), {
    message: "Tool URLs must be absolute http(s) URLs.",
  });

export const caseStudyToolSchema = z.object({
  label: z.string().trim().min(1),
  url: caseStudyToolUrlSchema.optional(),
});
