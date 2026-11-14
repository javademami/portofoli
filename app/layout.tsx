import type { Metadata } from "next";
import { Inter, Dancing_Script, Fira_Code } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css"; // 👈 این خط نباید حذف شود

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"], variable: "--font-inter" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["700"], variable: "--font-dancing" });
const fira = Fira_Code({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Javad Emami | Product Developer", template: "%s | Javad Emami" },
  description: "Product developer and full-stack engineer based in Stockholm. Web applications with Next.js, React and MongoDB, plus digital products.",
  openGraph: { type: "website", siteName: "Javad Emami" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`scroll-smooth ${inter.variable} ${dancing.variable} ${fira.variable}`}>
        <body className="antialiased text-slate-800 bg-white selection:bg-amber-400 selection:text-slate-900">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
