import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { WaitlistForm } from "@/app/_components/auth/WaitlistForm";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Join the Waitlist | ClipStitchr",
  description: "Join the ClipStitchr waitlist while sign ups are invite-only.",
  canonical: "/sign-up",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <AuthPageShell
      eyebrow="Private beta"
      title="ClipStitchr is open by invitation right now."
      description="The studio is already shaped around the real app experience: organize your media, build UGC-first ad variants, and keep finished exports ready for reuse."
    >
      <WaitlistForm />
    </AuthPageShell>
  );
}
