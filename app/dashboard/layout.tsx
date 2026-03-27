import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button"; // Will create

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#f5f4ef] dark:bg-[#0a0a0a] text-[#111] dark:text-[#f5f4ef] font-sans selection:bg-[#ff3b00] selection:text-white">
      {/* Brutalist Sidebar */}
      <aside className="w-64 border-r-4 border-[#111] dark:border-[#f5f4ef] flex flex-col p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-16">
          <Link href="/" className="font-heading font-black text-3xl uppercase tracking-tighter">
            Arena<span className="text-[#ff3b00]">.</span>
          </Link>
          <div className="mt-2 text-xs font-bold uppercase tracking-widest opacity-50">
            Control Center
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <Link 
            href="/dashboard" 
            className="block text-xl font-bold uppercase tracking-wider hover:text-[#ff3b00] hover:translate-x-2 transition-all before:content-['>'] before:opacity-0 hover:before:opacity-100 hover:before:mr-2"
          >
            Overview
          </Link>
          <Link 
            href="/dashboard/metrics" 
            className="block text-xl font-bold uppercase tracking-wider hover:text-[#ff3b00] hover:translate-x-2 transition-all opacity-50 before:content-['>'] before:opacity-0 hover:before:opacity-100 hover:before:mr-2"
          >
            Metrics
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="block text-xl font-bold uppercase tracking-wider hover:text-[#ff3b00] hover:translate-x-2 transition-all opacity-50 before:content-['>'] before:opacity-0 hover:before:opacity-100 hover:before:mr-2"
          >
            Config
          </Link>
        </nav>

        <div className="mt-auto pt-8 border-t-4 border-[#111] dark:border-[#f5f4ef]">
          <div className="mb-4">
            <span className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-1">Operative</span>
            <span className="font-heading font-bold text-xl uppercase truncate block text-[#ff3b00]">
              {session.user.name || session.user.email?.split("@")[0] || "Unknown"}
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="h-full w-full max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
