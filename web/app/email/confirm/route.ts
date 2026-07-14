import { handleEmailConfirmationGet } from "@/lib/clipstitchr/email/confirmation/handleEmailConfirmationGet";
import { handleEmailConfirmationPost } from "@/lib/clipstitchr/email/confirmation/handleEmailConfirmationPost";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleEmailConfirmationGet(request);
}

export async function POST(request: Request) {
  return handleEmailConfirmationPost(request);
}
