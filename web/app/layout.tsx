import type { Metadata } from "next";
import {
  Barlow_Condensed,
  DM_Sans,
  Geist_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { RootProviders } from "@/app/RootProviders";
import { brandAssets } from "@/lib/brandAssets";
import { getDevelopmentAuthBypassRequestStatus } from "@/lib/clipstitchr/development/auth/getDevelopmentAuthBypassRequestStatus";
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
        url: brandAssets.icon16,
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: brandAssets.icon32,
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: brandAssets.icon48,
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: brandAssets.icon192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: brandAssets.icon512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [{ url: brandAssets.favicon }],
    apple: [
      {
        url: brandAssets.appleTouchIcon,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: `/manifest.webmanifest?v=${brandAssets.cacheVersion}`,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const mayUseDevelopmentAuthBypass =
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS_ENABLED === "true";
  const isDevelopmentAuthBypass = mayUseDevelopmentAuthBypass
    ? await getDevelopmentAuthBypassRequestStatus()
    : false;
  const rootContent = await RootProviders({
    children: (
      <>
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
      </>
    ),
    isDevelopmentAuthBypass,
  });

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${barlowCondensed.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {rootContent}
      </body>
    </html>
  );
}
