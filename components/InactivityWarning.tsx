"use client";

import { Coffee, X } from "lucide-react";

interface InactivityWarningProps {
  show: boolean;
  onDismiss: () => void;
}

/**
 * InactivityWarning
 *
 * A slim, non-blocking top banner shown when the user hasn't moved their
 * mouse or pressed any key for 60+ seconds. Clicking the dismiss button
 * or interacting anywhere with the page (handled by the hook) will make
 * it go away.
 */
export function InactivityWarning({ show, onDismiss }: InactivityWarningProps) {
  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] animate-in slide-in-from-top-2 fade-in duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="bg-[#ff3b00] text-black px-4 py-2 flex items-center justify-between gap-4 border-b-4 border-[#111]">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 shrink-0" />
          <p className="text-xs font-black uppercase tracking-widest">
            You've been inactive for 60+ seconds — still with us?
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss inactivity warning"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
