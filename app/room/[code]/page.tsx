"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useDistractionTracker } from "@/hooks/useDistractionTracker";
import { useSessionState } from "@/hooks/useSessionState";
import { useTimer } from "@/hooks/useTimer";
import { DistractionToast } from "@/components/DistractionToast";
import { InactivityWarning } from "@/components/InactivityWarning";
import { AmbientSoundControl } from "@/components/AmbientSoundControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Plus, Check, FlaskConical } from "lucide-react";
import { useAmbientSound } from "@/hooks/useAmbientSound";

export interface Member {
  socketId: string;
  userName?: string;
  userId?: string;
  status: "focused" | "distracted" | "idle";
  tabSwitches: number;
  tasks?: { id: string; text: string; completed: boolean }[];
}

export interface RoomData {
  id: string;
  code: string;
  name: string;
  hostId: string;
  duration: string;
  maxMembers: string;
}

export default function RoomPage({ params: paramsPromise }: { params: Promise<{ code: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const roomCode = params.code;

  const [userName, setUserName] = useState(""); // empty until session loaded — prevents premature socket join
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [status, setStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newTask, setNewTask] = useState("");
  const [researchMode, setResearchMode] = useState(false);

  const sessionActive = status === "active";

  const socket = useSocket(roomCode, userName, userId);

  // Smart distraction tracker — replaces useTabGuard
  const {
    distractions,
    totalAwayTime,
    inactivityEvents,
    showToast,
    awaySeconds,
    dismissToast,
    declareWorkRelated,
    showInactivity,
    dismissInactivity,
  } = useDistractionTracker(socket, roomCode, userName, sessionActive, researchMode);

  // Session state manager
  const { startSession, finalizeSession } = useSessionState();
  const { mode: soundMode, volume: soundVolume, setMode: setSoundMode, setVolume: setSoundVolume } = useAmbientSound();

  /** Toggle research mode and broadcast updated status to the room */
  const toggleResearchMode = () => {
    const next = !researchMode;
    setResearchMode(next);
    // Let other members see the status change in real-time
    socket?.emit("tab-switch", {
      roomCode,
      userName,
      status: next ? "research" : "focused",
    });
  };

  const remainingSeconds = useTimer(endsAt);

  // ─── Initialize: fetch room + session identity ────────────────────────────

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const guestName = search.get("name");

    fetch(`/api/rooms?code=${roomCode}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) return router.push("/");
        setRoomData(data.room);

        const sessionRes = await fetch("/api/auth/get-session");
        if (sessionRes.ok) {
          const sessionText = await sessionRes.text();
          if (sessionText) {
            const sessionData = JSON.parse(sessionText);
            if (sessionData?.user) {
              setUserId(sessionData.user.id);
              setUserName(sessionData.user.name || guestName || "Operative");
              if (sessionData.user.id === data.room.hostId) setIsHost(true);
              return;
            }
          }
        }

        // Guest mode
        setUserName(guestName || `Guest-${Math.floor(Math.random() * 1000)}`);
      });
  }, [roomCode, router]);

  // ─── Socket event sync ────────────────────────────────────────────────────

  useEffect(() => {
    if (!socket) return;

    socket.on("members-updated", (m: Member[]) => setMembers(m));

    socket.on("session-started", ({ endsAt }: { endsAt: string }) => {
      setStatus("active");
      setEndsAt(endsAt);
      // Mark session start for focus time calculation
      startSession();
    });

    socket.on("session-ended", async () => {
      const tasksCompleted = tasks.filter((t) => t.completed).length;
      const totalTasks = tasks.length;

      // Build finalized session snapshot using the smart tracker data
      const session = finalizeSession({
        distractions,
        totalAwayTime,
        inactivityEvents,
        tasksCompleted,
        totalTasks,
      });

      // Attempt to save to DB (will 401 for guests — fine for MVP)
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          focusScore: session.focusScore,
          tabSwitches: session.distractions,
          idleMinutes: Math.round(session.totalAwayTime / 60000),
          tasksCompleted: session.tasksCompleted,
          totalTasks: session.totalTasks,
        }),
      }).catch(console.error);

      // Pass full stats to the summary page via query params
      router.push(
        `/room/${roomCode}/summary` +
          `?score=${session.focusScore}` +
          `&switches=${session.distractions}` +
          `&tasks=${session.tasksCompleted}` +
          `&awayTime=${Math.round(session.totalAwayTime / 1000)}` +  // in seconds
          `&focusTime=${session.focusSeconds}` +
          `&inactivity=${session.inactivityEvents}`
      );
    });

    return () => {
      socket.off("members-updated");
      socket.off("session-started");
      socket.off("session-ended");
    };
  }, [socket, roomCode, router, tasks, distractions, totalAwayTime, inactivityEvents, startSession, finalizeSession]);

  // ─── Auto-end timer (host only) ───────────────────────────────────────────

  useEffect(() => {
    if (status === "active" && endsAt && new Date(endsAt).getTime() <= Date.now() && isHost) {
      socket?.emit("end-session", { roomCode });
    }
  }, [remainingSeconds, status, endsAt, isHost, socket, roomCode]);

  // ─── Task helpers ─────────────────────────────────────────────────────────

  const toggleTask = (id: string, completed: boolean) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed } : t));
    setTasks(updated);
    socket?.emit("task-update", { roomCode, tasks: updated });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || tasks.length >= 5) return;
    const updated = [...tasks, { id: Math.random().toString(), text: newTask, completed: false }];
    setTasks(updated);
    socket?.emit("task-update", { roomCode, tasks: updated });
    setNewTask("");
  };

  if (!roomData)
    return (
      <div className="h-screen bg-[#111] flex items-center justify-center text-[#ff3b00] font-heading text-4xl uppercase animate-pulse">
        Initializing...
      </div>
    );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const awayTimeSec = Math.round(totalAwayTime / 1000);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f5f4ef] dark:bg-[#0a0a0a] text-[#111] dark:text-[#f5f4ef] overflow-hidden selection:bg-[#ff3b00] selection:text-white">

      {/* ── Overlay UI Components ── */}
      <InactivityWarning show={showInactivity} onDismiss={dismissInactivity} />
      <DistractionToast
        show={showToast}
        awaySeconds={awaySeconds}
        onDismiss={dismissToast}
        onWorkRelated={declareWorkRelated}
      />

      {/* Left Panel: Focus Console */}
      <div className="flex-1 border-b-4 md:border-b-0 md:border-r-4 border-[#111] p-8 md:p-12 flex flex-col relative overflow-y-auto">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#ff3b00] -translate-x-1/2 -translate-y-1/2 blur-[100px] opacity-10 pointer-events-none" />

        <header className="mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Focus Console</h2>
          <h1 className="font-heading text-4xl md:text-5xl font-black uppercase text-[#ff3b00] truncate">
            {roomData.name}
          </h1>
        </header>

        {/* Massive Timer */}
        <div className="flex-1 flex flex-col items-center justify-center mb-12 relative group py-8">
          <div className="text-[8rem] md:text-[12rem] font-heading font-black tracking-tighter leading-none group-hover:scale-105 transition-transform">
            {status === "active" ? formatTime(remainingSeconds) : roomData.duration.toString().padStart(2, "0") + ":00"}
          </div>
          <div className="absolute inset-0 border-4 border-[#111]/10 dark:border-[#f5f4ef]/10 rounded-full scale-110 pointer-events-none" />
          <div className="mt-8 flex flex-col items-center gap-4">
            <span
              className={`px-4 py-2 border-2 uppercase font-bold text-xs tracking-widest ${
                status === "active"
                  ? "border-[#ff3b00] text-[#ff3b00] bg-[#ff3b00]/10"
                  : "border-[#111] dark:border-[#f5f4ef]"
              }`}
            >
              {status === "waiting"
                ? isHost
                  ? "You Are The Host"
                  : "Awaiting Host Authorization"
                : status === "active"
                ? "Session Active"
                : "Session Ended"}
            </span>

            {/* Live distraction stats — only shown during active session */}
            {status === "active" && (
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest opacity-60">
                <span className={distractions > 0 ? "text-[#ff3b00] opacity-100" : ""}>
                  ⚡ {distractions} {distractions === 1 ? "distraction" : "distractions"}
                </span>
                {awayTimeSec > 0 && <span>⏱ {awayTimeSec}s away</span>}
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="mt-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">Task Queue ({tasks.length}/5)</h3>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 bg-white dark:bg-[#111] border-2 border-[#111] dark:border-[#f5f4ef] p-3 group"
              >
                <button
                  onClick={() => toggleTask(t.id, !t.completed)}
                  className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                    t.completed ? "bg-[#ff3b00] border-[#ff3b00] text-black" : "border-[#111]/50 dark:border-[#f5f4ef]/50"
                  }`}
                >
                  {t.completed && <Check className="w-4 h-4" />}
                </button>
                <span className={`font-bold transition-opacity ${t.completed ? "opacity-30 line-through" : ""}`}>
                  {t.text}
                </span>
              </div>
            ))}
            {tasks.length < 5 && (
              <form onSubmit={addTask} className="flex gap-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="ADD OBJECTIVE"
                  className="rounded-none border-2 border-[#111]/20 dark:border-[#f5f4ef]/20 h-12 uppercase font-bold"
                />
                <Button type="submit" className="rounded-none h-12 w-12 bg-[#111] dark:bg-[#f5f4ef] p-0 hover:bg-[#ff3b00]">
                  <Plus className="text-white dark:text-[#111]" />
                </Button>
              </form>
            )}
          </div>

          {/* Ambient Sound — placed at the bottom of the left panel */}
          <AmbientSoundControl
            mode={soundMode}
            volume={soundVolume}
            onModeChange={setSoundMode}
            onVolumeChange={setSoundVolume}
          />
        </div>
      </div>

      {/* Right Panel: The Arena (Multiplayer) */}
      <div className="w-full md:w-[450px] bg-[#111] dark:bg-[#0a0a0a] text-[#f5f4ef] flex flex-col overflow-y-auto">

        <div className="p-8 border-b-4 border-[#f5f4ef]/20 flex justify-between items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#ff3b00] mb-1">Access Code</div>
            <div className="font-heading text-4xl font-black tracking-widest">{roomCode}</div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-2 border-[#f5f4ef]/50 hover:bg-[#ff3b00] hover:border-[#ff3b00] hover:text-black bg-transparent text-[#f5f4ef]"
            onClick={() => navigator.clipboard.writeText(roomCode)}
          >
            <Copy className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">
              Operatives ({members.filter((m) => m.socketId !== socket?.id).length + 1}/{roomData.maxMembers})
            </h3>
            <span className="w-2 h-2 rounded-full bg-[#ff3b00] animate-pulse" />
          </div>

          <div className="space-y-4 flex-1">
            {/* Self Card */}
            <div className={`border-2 p-4 flex flex-col gap-3 relative overflow-hidden transition-colors ${
              researchMode
                ? "border-blue-400 bg-blue-400/10"
                : "border-[#ff3b00] bg-[#ff3b00]/10"
            }`}>
              <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${
                researchMode ? "bg-blue-400" : "bg-[#ff3b00]"
              }`} />
              <div className="flex justify-between items-center pl-4">
                <div className="font-heading font-black text-xl uppercase tracking-wider truncate mr-2">{userName} (You)</div>
                {/* Status badge — click to toggle research mode */}
                <button
                  onClick={status === "active" ? toggleResearchMode : undefined}
                  title={status === "active" ? (researchMode ? "Switch back to Focus Mode" : "Enable Research Mode — tab switches forgiven") : undefined}
                  className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 ${
                    researchMode
                      ? "bg-blue-400 text-black hover:bg-blue-300 cursor-pointer"
                      : status === "active"
                      ? "bg-[#ff3b00] text-black hover:bg-[#ff3b00]/80 cursor-pointer"
                      : "bg-[#ff3b00] text-black cursor-default"
                  }`}
                >
                  {researchMode ? (
                    <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3" />Research</span>
                  ) : distractions > 2 ? "Distracted" : "Focused"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 pl-4 text-xs font-bold opacity-70">
                <div className={distractions > 0 ? "text-[#ff3b00]" : ""}>DST: {distractions}</div>
                <div>{awayTimeSec > 0 ? `AWY: ${awayTimeSec}s` : "AWY: —"}</div>
                <div>TSK: {tasks.filter((t) => t.completed).length}/{tasks.length}</div>
              </div>
              {/* Research mode hint */}
              {researchMode && status === "active" && (
                <p className="pl-4 text-[10px] text-blue-300 font-bold uppercase tracking-wider">
                  Tab switches forgiven — click badge to exit
                </p>
              )}
            </div>

            {/* Other Members — exclude self to avoid duplicate */}
            {members
              .filter((m) => m.socketId !== socket?.id)
              .map((m) => (
                <div
                  key={m.socketId}
                  className={`border-2 p-4 flex flex-col gap-3 relative overflow-hidden ${
                    m.status === "distracted"
                      ? "border-[#ff3b00]/50 bg-[#ff3b00]/5"
                      : "border-[#f5f4ef]/20 bg-[#f5f4ef]/5"
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-2 h-full ${m.status === "distracted" ? "bg-[#ff3b00]" : "bg-[#f5f4ef]/50"}`} />
                  <div className="flex justify-between items-center pl-4">
                    <div className="font-heading font-black text-xl uppercase tracking-wider truncate mr-2">
                      {m.userName || "Unknown"}
                    </div>
                    <div
                      className={`px-2 py-1 text-black text-[10px] font-black uppercase tracking-widest ${
                        m.status === "distracted" ? "bg-[#ff3b00]" : "bg-[#f5f4ef]/50"
                      }`}
                    >
                      {m.status}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-4 text-xs font-bold opacity-70">
                    <div className={m.tabSwitches > 0 ? "text-[#ff3b00]" : ""}>DST: {m.tabSwitches}</div>
                    <div>TSK: {m.tasks?.filter((t: any) => t.completed).length || 0}/{m.tasks?.length || 0}</div>
                  </div>
                </div>
              ))}
          </div>

          {isHost && (
            <div className="mt-8 pt-8 border-t-4 border-[#f5f4ef]/20">
              {status === "waiting" ? (
                <Button
                  onClick={() => socket?.emit("start-session", { roomCode, duration: roomData.duration })}
                  className="w-full rounded-none h-16 text-xl font-black uppercase tracking-wider bg-[#ff3b00] text-black hover:bg-white"
                >
                  Initiate Session
                </Button>
              ) : (
                <Button
                  onClick={() => socket?.emit("end-session", { roomCode })}
                  variant="outline"
                  className="w-full rounded-none h-16 text-xl font-black uppercase tracking-wider border-2 border-[#ff3b00] text-[#ff3b00] bg-transparent hover:bg-[#ff3b00] hover:text-black"
                >
                  Abort Session
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
