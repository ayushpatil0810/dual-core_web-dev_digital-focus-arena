import { auth } from "@/lib/auth";
import { db } from "@/lib/auth";
import { focusSession } from "@/lib/auth-schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Trophy, Target, Zap, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const sessions = session?.user?.id
    ? await db.query.focusSession.findMany({
        where: eq(focusSession.userId, session.user.id),
        orderBy: [desc(focusSession.createdAt)],
        limit: 20,
      })
    : [];

  // ── Compute aggregate stats ──────────────────────────────────────────────
  const totalSessions = sessions.length;

  const avgScore =
    totalSessions > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + Number(s.focusScore ?? 0), 0) /
            totalSessions,
        )
      : 0;

  const bestScore =
    totalSessions > 0
      ? Math.max(...sessions.map((s) => Number(s.focusScore ?? 0)))
      : 0;

  const totalTasksCompleted = sessions.reduce(
    (sum, s) => sum + Number(s.tasksCompleted ?? 0),
    0,
  );

  // ── Helper ───────────────────────────────────────────────────────────────
  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-[#ff3b00]";
  };

  return (
    <div className="p-8 md:p-16 min-h-full flex flex-col gap-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            Status <br />
            <span className="text-[#ff3b00] drop-shadow-sm">Nominal</span>
          </h1>
          <p className="text-xl font-medium opacity-70">
            Welcome back, {session?.user.name ?? "Operative"}.
          </p>
        </div>

        <div className="flex flex-col gap-3 min-w-[200px]">
          <Link
            href="/room/create"
            className="bg-[#111] dark:bg-[#f5f4ef] text-[#f5f4ef] dark:text-[#111] font-black uppercase tracking-widest text-lg p-5 flex justify-between items-center hover:bg-[#ff3b00] dark:hover:bg-[#ff3b00] dark:hover:text-[#f5f4ef] transition-colors group"
          >
            Create Arena
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link
            href="/room/join"
            className="border-4 border-[#111] dark:border-[#f5f4ef] font-black uppercase tracking-widest text-lg p-4 flex justify-between items-center hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors group text-[#111] dark:text-[#f5f4ef]"
          >
            Join Arena
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </header>

      {/* ── Stats Row ──────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">
          Operator Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <Zap className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Sessions
              </span>
            </div>
            <div className="font-heading text-5xl font-black leading-none">
              {totalSessions}
            </div>
            <div className="text-xs opacity-50 mt-1">arenas entered</div>
          </div>

          {/* Average Score */}
          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Avg Score
              </span>
            </div>
            <div
              className={`font-heading text-5xl font-black leading-none ${totalSessions > 0 ? scoreColor(avgScore) : ""}`}
            >
              {totalSessions > 0 ? avgScore : "—"}
            </div>
            <div className="text-xs opacity-50 mt-1">/ 100 focus score</div>
          </div>

          {/* Best Score */}
          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Best Score
              </span>
            </div>
            <div
              className={`font-heading text-5xl font-black leading-none ${totalSessions > 0 ? scoreColor(bestScore) : ""}`}
            >
              {totalSessions > 0 ? bestScore : "—"}
            </div>
            <div className="text-xs opacity-50 mt-1">personal best</div>
          </div>

          {/* Tasks Completed */}
          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Objectives
              </span>
            </div>
            <div className="font-heading text-5xl font-black leading-none text-[#ff3b00]">
              {totalTasksCompleted}
            </div>
            <div className="text-xs opacity-50 mt-1">tasks completed</div>
          </div>
        </div>
      </section>

      {/* ── Mission Logs ───────────────────────────────────────────────── */}
      <section className="flex-1">
        <h2 className="font-heading text-3xl font-black uppercase mb-6 pb-4 border-b-4 border-[#111]/10 dark:border-[#f5f4ef]/10">
          Mission Logs
        </h2>

        {sessions.length === 0 ? (
          <div className="border-4 border-dashed border-[#111]/20 dark:border-[#f5f4ef]/20 p-16 text-center">
            <div className="font-heading text-4xl font-black uppercase opacity-20 mb-3">
              No Data
            </div>
            <p className="font-bold uppercase tracking-widest opacity-40 text-sm">
              No active deployments recorded yet.
            </p>
            <Link
              href="/room/create"
              className="mt-6 inline-flex items-center gap-2 bg-[#ff3b00] text-white px-6 py-3 font-black uppercase tracking-widest text-sm hover:bg-[#111] transition-colors"
            >
              Create First Arena <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.map((s) => {
              const score = Number(s.focusScore ?? 0);
              const switches = Number(s.tabSwitches ?? 0);
              const completed = Number(s.tasksCompleted ?? 0);
              const total = Number(s.totalTasks ?? 0);

              return (
                <div
                  key={s.id}
                  className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 relative group hover:bg-[#111] dark:hover:bg-[#f5f4ef] hover:text-[#f5f4ef] dark:hover:text-[#111] transition-colors"
                >
                  {/* Score bar accent */}
                  <div
                    className="absolute top-0 left-0 h-1 bg-[#ff3b00] transition-all"
                    style={{ width: `${score}%` }}
                  />

                  <div className="font-bold text-[10px] uppercase tracking-widest opacity-50 mb-1">
                    {fmtDate(s.createdAt)}
                  </div>
                  <div className="font-heading text-3xl font-black uppercase truncate text-[#ff3b00] mb-4">
                    {s.roomCode}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
                        Score
                      </div>
                      <div
                        className={`font-heading text-2xl font-black ${scoreColor(score)}`}
                      >
                        {score}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
                        Tasks
                      </div>
                      <div className="font-heading text-2xl font-black">
                        {completed}
                        <span className="text-sm opacity-50">/{total}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">
                        DST
                      </div>
                      <div
                        className={`font-heading text-2xl font-black ${switches > 0 ? "text-[#ff3b00]" : ""}`}
                      >
                        {switches}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
