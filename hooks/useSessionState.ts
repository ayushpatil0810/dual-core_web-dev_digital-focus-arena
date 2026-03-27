import { useRef, useCallback } from "react";

export interface SessionState {
  startTime: number | null;
  endTime: number | null;
  distractions: number;
  totalAwayTime: number; // ms
  inactivityEvents: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface FinalizedSession extends SessionState {
  endTime: number;
  /** Total session wall-clock duration in seconds */
  durationSeconds: number;
  /** Effective focus time (duration minus away time) in seconds */
  focusSeconds: number;
  /** Focus score 0–100 */
  focusScore: number;
}

/**
 * useSessionState
 *
 * Lightweight session lifecycle manager. Stores start time and provides
 * a `finalizeSession` helper that merges live tracking data into a
 * complete, scored session snapshot.
 */
export function useSessionState() {
  const startTimeRef = useRef<number | null>(null);

  /** Call when the session becomes active */
  const startSession = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Merge current tracking data into a finished session object.
   * Returns the finalized state including focus score.
   */
  const finalizeSession = useCallback(
    (data: {
      distractions: number;
      totalAwayTime: number; // ms
      inactivityEvents: number;
      tasksCompleted: number;
      totalTasks: number;
    }): FinalizedSession => {
      const endTime = Date.now();
      const startTime = startTimeRef.current ?? endTime;

      const durationSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));
      const awaySeconds = Math.round(data.totalAwayTime / 1000);
      const focusSeconds = Math.max(0, durationSeconds - awaySeconds);

      // Score formula:
      //  Base 100, minus 10 per real distraction, minus 5 per inactivity event,
      //  plus bonus up to 20 for task completion.
      const taskBonus =
        data.totalTasks > 0
          ? Math.round((data.tasksCompleted / data.totalTasks) * 20)
          : 0;

      const focusScore = Math.max(
        0,
        Math.min(
          100,
          100 - data.distractions * 10 - data.inactivityEvents * 5 + taskBonus
        )
      );

      return {
        startTime,
        endTime,
        durationSeconds,
        focusSeconds,
        focusScore,
        ...data,
      };
    },
    []
  );

  return { startSession, finalizeSession };
}
