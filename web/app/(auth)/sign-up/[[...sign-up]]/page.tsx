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
      title="Turn raw footage into finished ads while access is still private."
      description="Join if you are trying to grow a mobile app on TikTok and Reels without rebuilding the same editing workflow every week."
    >
      <WaitlistForm />
    </AuthPageShell>
  );
}
