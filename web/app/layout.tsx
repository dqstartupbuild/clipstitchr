import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsentManager } from "@/app/_components/analytics/CookieConsentManager";
import { ThemeModeScript } from "@/app/_components/theme/ThemeModeScript";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import { createPageMetadata } from "@/lib/metadata";
import {
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  site,
} from "@/lib/site";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  ...createPageMetadata({
    title: site.defaultTitle,
    description: site.defaultDescription,
    canonical: "/",
    keywords: site.keywords,
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeModeScript />
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          <CookieConsentManager />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(createWebsiteJsonLd()),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(createOrganizationJsonLd()),
            }}
          />
          <ConvexClientProvider>
            {children}
            <Analytics />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
