import { SiteHeader } from "@/app/site-header";
import { SiteFooter } from "@/app/site-footer";

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col bg-background text-foreground">
      <SiteHeader variant="content" />

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}
