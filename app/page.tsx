"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Users,
  Zap,
  Shield,
  Clock3,
} from "lucide-react";

export default function LandingPage() {
  const [guestName, setGuestName] = useState("Operative");
  const [roomCode, setRoomCode] = useState("");

  const instantJoinUrl = useMemo(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    if (!roomCode) return "";
    const params = new URLSearchParams();
    if (guestName) params.set("name", guestName);
    return `${base}/room/${roomCode}?${params.toString()}`;
  }, [guestName, roomCode]);

  const copyJoinLink = async () => {
    if (!instantJoinUrl) return;
    try {
      await navigator.clipboard.writeText(instantJoinUrl);
    } catch {
      // Ignore clipboard errors silently
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f4ef] selection:bg-[#ff3b00] selection:text-white flex flex-col">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center border-b border-white/10">
        <div className="font-heading font-bold text-2xl tracking-tighter uppercase">
          Focus.Arena
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/dashboard"
            className="hover:text-[#ff3b00] transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/room/join"
            className="px-4 py-2 border border-white/30 uppercase font-bold tracking-widest hover:border-[#ff3b00]"
          >
            Join
          </Link>
          <Link
            href="/room/create"
            className="px-5 py-2 bg-[#ff3b00] text-black font-black uppercase tracking-widest hover:bg-white"
          >
            Create Room
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-10 px-8 md:px-16 py-14 border-b border-white/10">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <Zap className="w-3 h-3 text-[#ff3b00]" /> Live Accountability
            Platform
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-black uppercase leading-[0.9]">
            Focus Together.
            <br />
            Win Together.
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl">
            Create a room in seconds, share a 6-character code, and watch your
            crew stay on task. Live tab-switch alerts, idle badges, and
            competitive focus scores keep everyone honest.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/room/create"
              className="inline-flex items-center gap-2 bg-[#ff3b00] text-black px-6 py-3 font-black uppercase tracking-widest hover:bg-white"
            >
              Create Arena
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/room/join"
              className="inline-flex items-center gap-2 border border-white/20 px-6 py-3 font-black uppercase tracking-widest hover:border-[#ff3b00]"
            >
              Join with Code
            </Link>
            <div className="flex items-center gap-2 text-sm opacity-70">
              <CheckCircle2 className="w-4 h-4 text-[#ff3b00]" /> No install. No
              accounts for guests.
            </div>
          </div>
          {/* Instant Join Generator */}
          <div className="mt-6 p-4 border border-white/10 bg-white/5">
            <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">
              Instant Join Link
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest name"
                className="bg-[#111] border border-white/10 px-3 py-2 text-sm focus:border-[#ff3b00] outline-none flex-1"
              />
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Room code (ABC123)"
                className="bg-[#111] border border-white/10 px-3 py-2 text-sm focus:border-[#ff3b00] outline-none w-full md:w-48 uppercase"
              />
              <button
                onClick={copyJoinLink}
                disabled={!instantJoinUrl}
                className={`inline-flex items-center gap-2 px-4 py-2 font-black uppercase tracking-widest border ${
                  instantJoinUrl
                    ? "border-[#ff3b00] text-[#ff3b00] hover:bg-[#ff3b00] hover:text-black"
                    : "border-white/10 text-white/40 cursor-not-allowed"
                }`}
              >
                <Copy className="w-4 h-4" /> Copy Link
              </button>
            </div>
            {instantJoinUrl && (
              <div className="mt-2 text-xs opacity-60 break-all">
                {instantJoinUrl}
              </div>
            )}
          </div>
        </div>

        {/* Screenshot-style previews */}
        <div className="space-y-4">
          <div className="p-5 bg-[#111] border border-white/10 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
            <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">
              Live Room Preview
            </div>
            <div className="bg-[#0f0f0f] border border-white/5 p-4">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest opacity-70 mb-3">
                <span>Room Code · AB3X7K</span>
                <span className="text-[#ff3b00]">Session Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["You", "Nova", "Kai", "Aria"].map((name, i) => (
                  <div key={name} className="border border-white/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading font-black uppercase text-sm">
                        {name}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-1 ${i === 0 ? "bg-[#ff3b00] text-black" : "bg-white/10"}`}
                      >
                        {i === 2 ? "Idle" : i === 3 ? "Research" : "Focused"}
                      </span>
                    </div>
                    <div className="text-xs opacity-70 flex items-center gap-2">
                      <span>DST {i}</span>
                      <span>
                        TSK {i}/{3}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#111] border border-white/10 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
            <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">
              Dashboard Snapshot
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Total Sessions", "Avg Score", "Best Streak", "Tasks Done"].map(
                (label, idx) => (
                  <div key={label} className="border border-white/10 p-3">
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                      {label}
                    </div>
                    <div className="font-heading text-3xl font-black text-[#ff3b00]">
                      {[24, 82, 6, 142][idx]}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 md:px-16 py-14 bg-[#0c0c0c] border-b border-white/10">
        <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">
          How It Works
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-black uppercase mb-8">
          Three steps to a focused session
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Create & Set Timer",
              copy: "Spin up a room, choose duration, and grab the 6-char code.",
            },
            {
              title: "Share & Join",
              copy: "Friends paste the code or use your instant link — no account needed.",
            },
            {
              title: "Focus & Compete",
              copy: "Live tab-switch alerts, idle badges, and focus scores keep everyone on task.",
            },
          ].map((item, idx) => (
            <div
              key={item.title}
              className="border border-white/10 p-5 bg-[#0f0f0f]"
            >
              <div className="text-[#ff3b00] font-black text-sm mb-2">
                0{idx + 1}
              </div>
              <div className="font-heading text-xl font-black mb-2">
                {item.title}
              </div>
              <p className="opacity-70 text-sm leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-8 md:px-16 py-14 border-b border-white/10">
        <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">
          Why operators stay
        </div>
        <h2 className="font-heading text-3xl md:text-4xl font-black uppercase mb-8">
          Built for accountability
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Live tab-switch + idle badges",
              copy: "Instantly see who drifted. Research mode forgives intentional cross-tab work.",
            },
            {
              title: "Pomodoro with drift guard",
              copy: "Server-synced timers with latency buffer keep everyone in lockstep.",
            },
            {
              title: "Session summary + leaderboard",
              copy: "Scores, tasks, away time, and rankings ready to share with your crew.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-white/10 p-5 bg-[#0f0f0f] flex flex-col gap-2"
            >
              <div className="font-heading text-xl font-black">
                {item.title}
              </div>
              <p className="opacity-70 text-sm leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="px-8 md:px-16 py-14 bg-[#0c0c0c] border-b border-white/10">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Focus sessions logged", value: "2,400+", icon: Clock3 },
            { label: "Avg focus score", value: "82", icon: Shield },
            { label: "Teams using arenas", value: "180+", icon: Users },
            { label: "Tab switches caught", value: "31k", icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="border border-white/10 p-5 bg-[#0f0f0f] flex items-center gap-3"
            >
              <Icon className="w-5 h-5 text-[#ff3b00]" />
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">
                  {label}
                </div>
                <div className="font-heading text-3xl font-black">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 bg-[#111]">
        <div>
          <div className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">
            Ready to deploy
          </div>
          <h3 className="font-heading text-3xl font-black uppercase">
            Spin up your next focus arena
          </h3>
          <p className="opacity-70 mt-2">
            Create a room, drop the code, and start a synchronized timer with
            drift guard.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/room/create"
            className="px-6 py-3 bg-[#ff3b00] text-black font-black uppercase tracking-widest hover:bg-white"
          >
            Create Room
          </Link>
          <Link
            href="/room/join"
            className="px-6 py-3 border border-white/20 font-black uppercase tracking-widest hover:border-[#ff3b00]"
          >
            Join with Code
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-16 py-10 text-sm bg-[#0a0a0a] text-white/70">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="font-heading font-black text-xl uppercase text-white">
              Focus.Arena
            </div>
            <div className="opacity-60">
              Real-time accountability for study and work sprints.
            </div>
          </div>
          <div className="flex gap-4 uppercase tracking-widest text-xs">
            <Link href="/room/create" className="hover:text-[#ff3b00]">
              Create
            </Link>
            <Link href="/room/join" className="hover:text-[#ff3b00]">
              Join
            </Link>
            <Link href="/dashboard" className="hover:text-[#ff3b00]">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
