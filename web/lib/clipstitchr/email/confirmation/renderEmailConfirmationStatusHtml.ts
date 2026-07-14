import { createEmailConfirmationHtmlDocument } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationHtmlDocument";

const statusCopy = {
  confirmed: {
    description:
      "Your email is confirmed. You can close this page and head back to the tool you were using.",
    title: "Email confirmed",
  },
  error: {
    description:
      "We could not confirm your email right now. Please wait a moment and try again.",
    title: "Something went wrong",
  },
  rateLimited: {
    description:
      "There have been too many confirmation tries. Please wait, then try again.",
    title: "Please try again later",
  },
  unavailable: {
    description:
      "This confirmation link cannot be used. Return to the public tool and request a new confirmation.",
    title: "Link unavailable",
  },
} as const;

export function renderEmailConfirmationStatusHtml(
  status: keyof typeof statusCopy,
) {
  const copy = statusCopy[status];

  return createEmailConfirmationHtmlDocument({
    bodyHtml: `<h1>${copy.title}</h1><p>${copy.description}</p>`,
    title: copy.title,
  });
}
