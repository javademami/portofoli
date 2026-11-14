import { auth } from "@clerk/nextjs/server";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { LanguageProvider } from "@/components/site/LanguageContext";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col bg-[#0B0D13] text-white">
        <SiteHeader isSignedIn={!!userId} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  );
}