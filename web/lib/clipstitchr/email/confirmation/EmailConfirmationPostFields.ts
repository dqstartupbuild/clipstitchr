import type { EmailConfirmationUrlFields } from "@/lib/clipstitchr/email/confirmation/EmailConfirmationUrlFields";

export type EmailConfirmationPostFields = EmailConfirmationUrlFields & {
  csrfToken: string;
};
