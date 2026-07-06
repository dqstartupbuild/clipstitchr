import type { Metadata } from "next";
import { CliConnectPageClient } from "./CliConnectPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  canonical: "/cli/connect",
  description: "Connect the ClipStitchr command line to your account.",
  noIndex: true,
  title: `Connect CLI | ${site.name}`,
});

type CliConnectPageProps = {
  searchParams: Promise<{
    code?: string;
  }>;
};

export default async function CliConnectPage({
  searchParams,
}: CliConnectPageProps) {
  const { code } = await searchParams;

  return <CliConnectPageClient userCode={code?.trim().toUpperCase()} />;
}
