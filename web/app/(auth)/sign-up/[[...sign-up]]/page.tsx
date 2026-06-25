import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { WaitlistForm } from "@/app/_components/auth/WaitlistForm";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Join the Waitlist | ClipStitchr",
  description:
    "Join the ClipStitchr waitlist if growing on short-form matters but making content is the part you keep avoiding.",
  canonical: "/sign-up",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Private beta"
      title="Built by someone who hates making content. Access is still invite-only."
      description="Join if you are trying to grow a mobile app on TikTok and Reels but do not want content work taking over the week."
    >
      <WaitlistForm />
    </AuthPageShell>
  );
}
