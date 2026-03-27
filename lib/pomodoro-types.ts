/**
 * Pomodoro Type Definitions
 *
 * Types for the Pomodoro timer feature that manages work/break cycles.
 */

export type PomodoroPhase = "work" | "break";

export interface PomodoroConfig {
  workMinutes: number;
  breakMinutes: number;
}

export interface PomodoroState {
  enabled: boolean;
  phase: PomodoroPhase;
  cyclesCompleted: number;
  currentCycleEndsAt: string | null; // ISO timestamp
}

export const POMODORO_PRESETS: Record<string, PomodoroConfig> = {
  classic: { workMinutes: 25, breakMinutes: 5 },
  extended: { workMinutes: 50, breakMinutes: 10 },
  sprint: { workMinutes: 15, breakMinutes: 3 },
};

export const DEFAULT_POMODORO_CONFIG = POMODORO_PRESETS.classic;
