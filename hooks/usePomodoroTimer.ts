"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PomodoroPhase,
  PomodoroConfig,
  PomodoroState,
} from "@/lib/pomodoro-types";
import type { Socket } from "socket.io-client";

interface UsePomodoroTimerOptions {
  enabled: boolean;
  config: PomodoroConfig;
  socket: Socket | null;
  roomCode: string;
  isHost: boolean;
}

interface PomodoroTimerReturn {
  phase: PomodoroPhase;
  cyclesCompleted: number;
  currentCycleEndsAt: string | null;
  timeRemaining: number; // seconds
  startCycle: (phase: PomodoroPhase) => void;
}

const SYNC_GUARD_MS = 150; // small buffer to absorb latency when starting timers

/**
 * usePomodoroTimer
 *
 * Manages Pomodoro work/break cycles for focus sessions.
 * Only the host can trigger phase transitions, which are broadcast to all members.
 *
 * Flow:
 * 1. Session starts in "work" phase
 * 2. When work timer expires, host broadcasts "break" phase
 * 3. When break timer expires, host broadcasts "work" phase (new cycle)
 * 4. Cycle count increments with each completed work phase
 */
export function usePomodoroTimer({
  enabled,
  config,
  socket,
  roomCode,
  isHost,
}: UsePomodoroTimerOptions): PomodoroTimerReturn {
  const [phase, setPhase] = useState<PomodoroPhase>("work");
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [currentCycleEndsAt, setCurrentCycleEndsAt] = useState<string | null>(
    null,
  );
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Start a new cycle (host only)
  const startCycle = useCallback(
    (newPhase: PomodoroPhase) => {
      if (!enabled || !socket || !isHost) return;

      const duration =
        newPhase === "work" ? config.workMinutes : config.breakMinutes;
      const endsAt = new Date(
        Date.now() + duration * 60000 + SYNC_GUARD_MS,
      ).toISOString();

      socket.emit("pomodoro-cycle", {
        roomCode,
        phase: newPhase,
        endsAt,
      });
    },
    [enabled, socket, isHost, roomCode, config],
  );

  // Listen for cycle broadcasts from host
  useEffect(() => {
    if (!enabled || !socket) return;

    const handleCycle = ({
      phase: newPhase,
      endsAt,
      serverNow,
    }: {
      phase: PomodoroPhase;
      endsAt: string;
      serverNow?: number;
    }) => {
      const drift = serverNow ? Date.now() - serverNow : 0;
      const correctedEndsAt = new Date(
        new Date(endsAt).getTime() - drift,
      ).toISOString();

      setPhase(newPhase);
      setCurrentCycleEndsAt(correctedEndsAt);

      // Increment cycle count when transitioning from work to break
      if (newPhase === "break") {
        setCyclesCompleted((prev) => prev + 1);
      }
    };

    socket.on("pomodoro-cycle", handleCycle);

    return () => {
      socket.off("pomodoro-cycle", handleCycle);
    };
  }, [enabled, socket]);

  // Countdown timer (recalculates every second to avoid drift)
  useEffect(() => {
    if (!enabled || !currentCycleEndsAt) {
      setTimeRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(currentCycleEndsAt).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));

      setTimeRemaining(remaining);

      // Auto-transition when cycle expires (host only)
      if (remaining === 0 && isHost) {
        const nextPhase = phase === "work" ? "break" : "work";
        setTimeout(() => startCycle(nextPhase), 1000); // Small delay for UX
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, currentCycleEndsAt, isHost, phase, startCycle]);

  // Initialize first cycle when enabled (host only)
  useEffect(() => {
    if (enabled && isHost && !currentCycleEndsAt) {
      startCycle("work");
    }
  }, [enabled, isHost, currentCycleEndsAt, startCycle]);

  return {
    phase,
    cyclesCompleted,
    currentCycleEndsAt,
    timeRemaining,
    startCycle,
  };
}
