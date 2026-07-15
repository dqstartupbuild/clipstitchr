import { SignIn } from "@clerk/nextjs";
import { AuthPageShell } from "@/app/_components/auth/AuthPageShell";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Sign in | ClipStitchr",
  description:
    "Sign in to ClipStitchr to manage Hook/UGC clips, product demos, drafts, and finished Stitches.",
  canonical: "/sign-in",
  noIndex: true,
});

export default function SignInPage() {
  return (
    <AuthPageShell
      eyebrow="ClipStitchr access"
      title="Sign in to ClipStitchr."
      description="Manage Hook/UGC clips, product demos, avatar photos, Stitches, Swipes, and longer vertical exports."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#ad7659",
            colorText: "#201510",
            colorTextSecondary: "#725f53",
            borderRadius: "0.2rem",
            fontFamily: "Arial, Helvetica, sans-serif",
          },
          elements: {
            rootBox: { width: "100%", maxWidth: "28rem" },
            cardBox: {
              width: "100%",
              border: 0,
              borderRadius: "0.2rem",
              boxShadow: "none",
            },
            card: {
              width: "100%",
              borderRadius: "0.2rem",
              boxShadow: "none",
            },
            headerTitle: { color: "#f5f0e9" },
            headerSubtitle: { color: "#a7998e" },
            formButtonPrimary: {
              backgroundColor: "#ad7659",
              borderRadius: "0.2rem",
              boxShadow: "none",
            },
            footerActionLink: { color: "#ddb498" },
          },
        }}
      />
    </AuthPageShell>
  );
}
