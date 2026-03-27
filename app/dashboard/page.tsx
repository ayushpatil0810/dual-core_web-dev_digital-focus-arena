import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="p-8 md:p-16 h-full flex flex-col">
      <header className="mb-16">
        <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
          Status <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3b00] to-[#ff8c00] drop-shadow-sm">Nominal</span>
        </h1>
        <p className="text-xl md:text-2xl font-medium opacity-80 max-w-2xl">
          Welcome back to the Arena, {session?.user.name ? session.user.name : "Operative"}. Your metrics are optimal.
        </p>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Brutalist Data Block */}
        <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-8 relative group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors cursor-crosshair flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-heading text-9xl font-black opacity-[0.03] group-hover:opacity-[0.05] transition-opacity -translate-y-8 translate-x-4">
            A
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Primary Objective</h3>
            <div className="font-heading text-4xl font-bold uppercase w-10/12 leading-none">
              Deep Work Session
            </div>
          </div>
          <div className="mt-16 flex items-end justify-between">
            <span className="text-6xl font-black font-heading tracking-tighter text-[#ff3b00] group-hover:text-[#ff3b00]">
              2.4<span className="text-3xl">HRS</span>
            </span>
          </div>
        </div>

        <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-8 relative group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors cursor-crosshair flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 p-4 font-heading text-9xl font-black opacity-[0.03] group-hover:opacity-[0.05] transition-opacity -translate-y-8 translate-x-4">
            B
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Distraction Blocks</h3>
            <div className="font-heading text-4xl font-bold uppercase w-10/12 leading-none">
              Threats Neutralized
            </div>
          </div>
          <div className="mt-16 flex items-end justify-between">
            <span className="text-6xl font-black font-heading tracking-tighter">
              18<span className="text-3xl">x</span>
            </span>
          </div>
        </div>

        <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-8 bg-[#ff3b00] text-[#111] relative group hover:bg-[#ff1a00] transition-colors cursor-crosshair flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-2">Systems</h3>
            <div className="font-heading text-4xl font-bold uppercase w-10/12 leading-none">
              Initiate New Flow
            </div>
          </div>
          <div className="mt-16 flex justify-end">
            <div className="w-16 h-16 rounded-full bg-[#111] text-[#ff3b00] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
