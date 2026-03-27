"use client";

import { useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Copy, Plus, Home, Clock, AlertTriangle, Coffee } from "lucide-react";

function SummaryContent({ roomCode }: { roomCode: string }) {
  const searchParams = useSearchParams();

  const score       = parseInt(searchParams.get("score")     || "0", 10);
  const switches    = parseInt(searchParams.get("switches")  || "0", 10);
  const tasks       = parseInt(searchParams.get("tasks")     || "0", 10);
  const awayTimeSec = parseInt(searchParams.get("awayTime")  || "0", 10);   // seconds
  const focusTimeSec= parseInt(searchParams.get("focusTime") || "0", 10);   // seconds
  const inactivity  = parseInt(searchParams.get("inactivity")|| "0", 10);

  /** Format seconds → "Xm Ys" */
  const fmtSeconds = (s: number) => {
    if (s <= 0) return "0s";
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m === 0) return `${rem}s`;
    if (rem === 0) return `${m}m`;
    return `${m}m ${rem}s`;
  };

  useEffect(() => {
    // Fire confetti on load
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ff3b00", "#111111", "#f5f4ef"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ff3b00", "#111111", "#f5f4ef"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleCopy = () => {
    const text = [
      `FocusArena Session [${roomCode}]`,
      `Score:         ${score}/100`,
      `Focus Time:    ${fmtSeconds(focusTimeSec)}`,
      `Away Time:     ${fmtSeconds(awayTimeSec)}`,
      `Distractions:  ${switches}`,
      `Inactivity:    ${inactivity} event${inactivity !== 1 ? "s" : ""}`,
      `Tasks Done:    ${tasks}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#ff3b00] text-[#111] flex flex-col items-center justify-center p-4 selection:bg-[#111] selection:text-[#ff3b00]">
      <div className="w-full max-w-4xl bg-[#f5f4ef] dark:bg-[#0a0a0a] border-4 border-[#111] p-8 md:p-16 shadow-[16px_16px_0_0_#111] relative">
        <div className="absolute top-0 right-0 p-4 font-heading font-black text-6xl md:text-9xl opacity-5 uppercase select-none pointer-events-none">
          DONE
        </div>

        <header className="mb-12 relative z-10 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-70 mb-2">Session Complete</h2>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#111] dark:text-[#f5f4ef]">
            Arena <br /> Cleared
          </h1>
        </header>

        {/* ── Primary Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 text-center hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Focus Score</div>
            <div className="font-heading text-5xl font-black text-[#ff3b00]">{score}</div>
            <div className="text-xs opacity-50 mt-1">/ 100</div>
          </div>

          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 text-center hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Distractions
            </div>
            <div className={`font-heading text-5xl font-black ${switches > 0 ? "text-[#ff3b00]" : ""}`}>{switches}</div>
            <div className="text-xs opacity-50 mt-1">{switches === 0 ? "perfect focus!" : "threshold breaks"}</div>
          </div>

          <div className="border-4 border-[#111] dark:border-[#f5f4ef] p-6 text-center hover:bg-[#111] hover:text-[#f5f4ef] dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors">
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Objectives Met</div>
            <div className="font-heading text-5xl font-black text-[#ff3b00]">{tasks}</div>
            <div className="text-xs opacity-50 mt-1">tasks completed</div>
          </div>
        </div>

        {/* ── Secondary Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border-2 border-[#111]/40 dark:border-[#f5f4ef]/30 p-5 text-center bg-white/50 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Focus Time
            </div>
            <div className="font-heading text-3xl font-black">{fmtSeconds(focusTimeSec)}</div>
            <div className="text-[10px] opacity-40 mt-0.5">active focus</div>
          </div>

          <div className="border-2 border-[#111]/40 dark:border-[#f5f4ef]/30 p-5 text-center bg-white/50 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Away Time</div>
            <div className={`font-heading text-3xl font-black ${awayTimeSec > 0 ? "text-[#ff3b00]" : ""}`}>
              {fmtSeconds(awayTimeSec)}
            </div>
            <div className="text-[10px] opacity-40 mt-0.5">tab switches &gt;30s</div>
          </div>

          <div className="border-2 border-[#111]/40 dark:border-[#f5f4ef]/30 p-5 text-center bg-white/50 dark:bg-white/5">
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1 flex items-center justify-center gap-1">
              <Coffee className="w-3 h-3" /> Inactivity
            </div>
            <div className="font-heading text-3xl font-black">{inactivity}</div>
            <div className="text-[10px] opacity-40 mt-0.5">60s+ idle events</div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
          <button
            onClick={handleCopy}
            className="h-16 border-2 border-[#111] dark:border-[#f5f4ef] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#111] hover:text-white dark:hover:bg-[#f5f4ef] dark:hover:text-[#111] transition-colors"
          >
            <Copy className="w-4 h-4" /> Export Config
          </button>
          <Link
            href="/room/create"
            className="h-16 border-2 border-[#111] dark:border-[#f5f4ef] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ff3b00] hover:text-white hover:border-[#ff3b00] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Arena
          </Link>
          <Link
            href="/dashboard"
            className="h-16 bg-[#111] dark:bg-[#f5f4ef] text-white dark:text-[#111] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ff3b00] dark:hover:bg-[#ff3b00] dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" /> Base Camp
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SummaryPage({ params: paramsPromise }: { params: Promise<{ code: string }> }) {
  const params = use(paramsPromise);
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#ff3b00] flex items-center justify-center text-[#111] font-heading text-4xl uppercase animate-pulse">
        Tallying...
      </div>
    }>
      <SummaryContent roomCode={params.code} />
    </Suspense>
  );
}
