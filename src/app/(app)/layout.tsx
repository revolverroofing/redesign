import { SiteHeader } from "@/components/site-header";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </>
  );
}
