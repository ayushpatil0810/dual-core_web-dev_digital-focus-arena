import { auth } from "@/lib/auth";
import { db } from "@/lib/auth";
import { focusSession } from "@/lib/auth-schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sessions = session?.user?.id ? await db.query.focusSession.findMany({
    where: eq(focusSession.userId, session.user.id),
    orderBy: [desc(focusSession.createdAt)],
    limit: 10
  }) : [];

  return (
    <div className="p-8 md:p-16 h-full flex flex-col">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            Status <br />
            <span className="text-[#ff3b00] drop-shadow-sm">Nominal</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-80 max-w-2xl">
            Welcome back to the Arena, {session?.user.name ? session.user.name : "Operative"}. Your metrics are optimal.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 min-w-[200px]">
          <Link href="/room/create" className="bg-[#111] dark:bg-[#f5f4ef] text-[#f5f4ef] dark:text-[#111] font-black uppercase tracking-widest text-lg p-6 flex justify-between items-center hover:bg-[#ff3b00] dark:hover:bg-[#ff3b00] dark:hover:text-[#f5f4ef] transition-colors group">
            Create Arena
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link href="/room/join" className="border-4 border-[#111] dark:border-[#f5f4ef] font-black uppercase tracking-widest text-lg p-5 flex justify-between items-center hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors group text-[#111] dark:text-[#f5f4ef]">
            Join Arena
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </header>

      <div className="flex-1">
        <h2 className="font-heading text-3xl font-black uppercase mb-8 pb-4 border-b-4 border-[#111]/10 dark:border-[#f5f4ef]/10">Mission Logs</h2>
        
        {sessions.length === 0 ? (
          <div className="border-4 border-[#111]/20 dark:border-[#f5f4ef]/20 p-12 text-center opacity-50 font-bold uppercase tracking-widest">
            No active deployments recorded.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map((s) => (
              <div key={s.id} className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 relative group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors cursor-crosshair">
                <div className="font-bold text-xs uppercase tracking-widest opacity-60 mb-2">{new Date(s.createdAt).toLocaleDateString()}</div>
                <div className="font-heading text-3xl font-black uppercase truncate text-[#ff3b00]">{s.roomCode}</div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Score</div>
                    <div className="font-heading text-2xl font-black">{s.focusScore}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-50">Tasks</div>
                    <div className="font-heading text-2xl font-black">{s.tasksCompleted}/{s.totalTasks}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
