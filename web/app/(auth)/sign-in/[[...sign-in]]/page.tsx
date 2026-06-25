import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sign in | ClipStitchr",
  description:
    "Sign in to ClipStitchr to manage saved clips, product demos, drafts, and finished ads without reopening the whole content mess.",
  canonical: "/sign-in",
  noIndex: true,
});

export default function SignInPage() {
  return (
    <AuthPageShell
      eyebrow="ClipStitchr access"
      title="Back to the place where your clips actually turn into ads."
      description="Sign in to manage UGC clips, product demos, avatar photos, stitches, swipes, and longer vertical exports from one workspace."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#6c47ff",
            colorText: "#111827",
            colorTextSecondary: "#64748b",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-plus-jakarta-sans)",
          },
          elements: {
            rootBox: "w-full max-w-md",
            cardBox: "w-full shadow-sm border border-border",
            card: "w-full",
            headerTitle: "text-text-primary",
            headerSubtitle: "text-text-secondary",
            formButtonPrimary: "bg-accent hover:bg-accent-dark",
            footerActionLink: "text-accent-dark",
          },
        }}
      />
    </AuthPageShell>
  );
}
