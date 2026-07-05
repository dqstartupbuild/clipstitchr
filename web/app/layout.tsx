import type { Metadata } from "next";
import {
  Barlow_Condensed,
  DM_Sans,
  Geist_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsentManager } from "@/app/_components/analytics/CookieConsentManager";
import { ThemeModeScript } from "@/app/_components/theme/ThemeModeScript";
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

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "548x550",
        type: "image/png",
      },
      {
        url: "/brand/icon-dark.png",
        media: "(prefers-color-scheme: dark)",
        sizes: "548x550",
        type: "image/png",
      },
    ],
  },
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
      className={`${plusJakartaSans.variable} ${barlowCondensed.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeModeScript />
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
