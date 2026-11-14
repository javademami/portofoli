import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0D13] text-white">
      <nav className="px-6 py-4 border-b border-zinc-800 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-20">
        <Link
          href="/store"
          className="text-sm text-zinc-400 hover:text-white underline underline-offset-4"
        >
          ← Back to store
        </Link>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}