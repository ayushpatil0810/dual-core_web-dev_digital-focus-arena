import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

// How long (ms) the user must be away before it counts as a distraction
const AWAY_THRESHOLD_MS = 30_000; // 30 seconds

// How long (ms) of no mouse/keyboard before inactivity warning fires
const INACTIVITY_THRESHOLD_MS = 60_000; // 60 seconds

// How long (ms) before the toast auto-dismisses without action
const TOAST_AUTODISMISS_MS = 8_000;

export interface DistractionState {
  /** Number of confirmed distractions (threshold exceeded + not declared work-related) */
  distractions: number;
  /** Total milliseconds spent away (only from threshold-exceeding trips) */
  totalAwayTime: number;
  /** Number of inactivity events (60s+ of no mouse/keyboard) */
  inactivityEvents: number;
  /** Whether the away-time toast should be shown */
  showToast: boolean;
  /** Seconds the user was away during the most recent threshold-exceeding trip */
  awaySeconds: number;
  /** Dismiss the toast, counting the absence as a distraction (default) */
  dismissToast: () => void;
  /** Declare the absence as work-related: un-counts the distraction */
  declareWorkRelated: () => void;
  /** Whether the inactivity warning banner should be shown */
  showInactivity: boolean;
  /** Dismiss the inactivity banner */
  dismissInactivity: () => void;
}

/**
 * useDistractionTracker
 *
 * Replaces the naive useTabGuard with a smart, threshold-based distraction
 * tracking system. Key behaviours:
 *  - Away < AWAY_THRESHOLD_MS (30s) → silent, no penalty.
 *  - Away ≥ threshold → distraction counted, toast shown, self-declaration offered.
 *  - researchMode = true → ALL tab switches silently forgiven (user declared cross-tab work).
 *  - No mouse/keyboard for INACTIVITY_THRESHOLD_MS (60s) → inactivity event counted.
 *  - Socket event emitted only for real distractions (not every tab switch).
 */
export function useDistractionTracker(
  socket: Socket | null,
  roomCode: string,
  userName: string,
  sessionActive: boolean,
  researchMode: boolean
): DistractionState {
  const [distractions, setDistractions] = useState(0);
  const [totalAwayTime, setTotalAwayTime] = useState(0);
  const [inactivityEvents, setInactivityEvents] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [awaySeconds, setAwaySeconds] = useState(0);
  const [showInactivity, setShowInactivity] = useState(false);

  // Ref to store when the tab was hidden — avoids stale closure issues
  const hiddenAtRef = useRef<number | null>(null);
  // Track whether the pending distraction is still "provisional"
  // (can be un-done via work-related declaration)
  const pendingDistractionRef = useRef(false);
  // Toast auto-dismiss timer handle
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Inactivity timer handle
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether the user is currently flagged as idle (to avoid duplicate emits)
  const isIdleRef = useRef(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Cancel the toast auto-dismiss timer */
  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  /** Dismiss toast and keep the distraction count (default / "No" path) */
  const dismissToast = useCallback(() => {
    clearToastTimer();
    pendingDistractionRef.current = false;
    setShowToast(false);
  }, [clearToastTimer]);

  /** Declare the absence as work-related → un-count the distraction */
  const declareWorkRelated = useCallback(() => {
    clearToastTimer();
    if (pendingDistractionRef.current) {
      // Revert the distraction that was just added
      setDistractions((d) => Math.max(0, d - 1));
      pendingDistractionRef.current = false;
    }
    setShowToast(false);
  }, [clearToastTimer]);

  /** Dismiss the inactivity warning */
  const dismissInactivity = useCallback(() => {
    setShowInactivity(false);
  }, []);

  // ─── Page Visibility (Tab Switch) Tracking ────────────────────────────────

  useEffect(() => {
    if (!socket || !roomCode || !userName) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Store when the user left
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        if (hiddenAtRef.current === null) return;

        const awayMs = Date.now() - hiddenAtRef.current;
        hiddenAtRef.current = null;

        // Ignore short absences — user likely just switching quickly
        if (awayMs < AWAY_THRESHOLD_MS) return;

        // ── Research Mode: user declared cross-tab work → silently forgive ──
        // No penalty, no toast, no socket event. The switch is completely
        // invisible to the session, as intended.
        if (researchMode) return;

        const awayS = Math.round(awayMs / 1000);

        // Only count distractions when a session is active
        if (!sessionActive) return;

        // Accumulate away time
        setTotalAwayTime((t) => t + awayMs);

        // Count as a distraction (provisional — can be reversed)
        setDistractions((d) => d + 1);
        pendingDistractionRef.current = true;

        // Emit socket event to update the room UI for other members
        socket.emit("tab-switch", { roomCode, userName });

        // Show toast
        setAwaySeconds(awayS);
        setShowToast(true);

        // Auto-dismiss after TOAST_AUTODISMISS_MS
        clearToastTimer();
        toastTimerRef.current = setTimeout(() => {
          // Auto-dismiss = treat as "No" — keep the distraction count
          pendingDistractionRef.current = false;
          setShowToast(false);
        }, TOAST_AUTODISMISS_MS);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, roomCode, userName, sessionActive, researchMode, clearToastTimer]);

  // ─── Inactivity Tracking ──────────────────────────────────────────────────
  //
  // IMPORTANT: The timer is paused while the tab is hidden.
  // This prevents every room member's browser from firing the inactivity
  // warning simultaneously just because no one is moving the mouse in a
  // tab they've switched away from. Only the user who is *actively on this
  // tab* and not interacting should see the "still with us?" banner.

  useEffect(() => {
    if (!sessionActive) return;

    /** Stop the idle countdown (tab went hidden, user is elsewhere) */
    const pauseInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };

    /** Mark the user as active again and broadcast recovery */
    const markActive = () => {
      if (!isIdleRef.current) return;
      isIdleRef.current = false;
      setShowInactivity(false);
      if (socket && roomCode && userName) {
        socket.emit("user-active", { roomCode, userName });
      }
    };

    /** (Re)start the idle countdown — called on tab focus or any user input */
    const resetInactivityTimer = () => {
      // If the tab is not visible, don't track inactivity here
      if (document.visibilityState === "hidden") return;

      // Any interaction marks the user as active if they were idle
      markActive();

      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

      inactivityTimerRef.current = setTimeout(() => {
        // Only fire if the tab is still visible when the timer expires
        if (document.visibilityState === "hidden") return;
        setInactivityEvents((n) => n + 1);
        setShowInactivity(true);

        if (!isIdleRef.current && socket && roomCode && userName) {
          isIdleRef.current = true;
          socket.emit("user-idle", { roomCode, userName });
        }
      }, INACTIVITY_THRESHOLD_MS);
    };

    /** Visibility change handler — pause on hide, resume on show */
    const handleVisibilityForInactivity = () => {
      if (document.visibilityState === "hidden") {
        // User left this tab → pause, dismiss any open banner
        pauseInactivityTimer();
        setShowInactivity(false);
      } else {
        // User returned to this tab → restart the idle clock fresh
        markActive();
        resetInactivityTimer();
      }
    };

    // Only start the timer if this tab is currently visible
    if (document.visibilityState === "visible") {
      resetInactivityTimer();
    }

    const inputEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    inputEvents.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityForInactivity);

    return () => {
      inputEvents.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      document.removeEventListener("visibilitychange", handleVisibilityForInactivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionActive]); // only re-run when session toggles on/off

  // ─── Cleanup toast timer on unmount ───────────────────────────────────────

  useEffect(() => {
    return () => {
      clearToastTimer();
    };
  }, [clearToastTimer]);

  return {
    distractions,
    totalAwayTime,
    inactivityEvents,
    showToast,
    awaySeconds,
    dismissToast,
    declareWorkRelated,
    showInactivity,
    dismissInactivity,
  };
}
