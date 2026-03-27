"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X, Briefcase, Zap } from "lucide-react";

interface DistractionToastProps {
  show: boolean;
  awaySeconds: number;
  onDismiss: () => void;           // "No" path — keeps the distraction count
  onWorkRelated: () => void;       // "Yes" path — un-counts the distraction
  autoDismissMs?: number;          // optional visual countdown (default: 8000)
}

/**
 * DistractionToast
 *
 * Non-intrusive slide-in toast shown when the user returns to the tab after
 * being away for longer than the threshold. Offers a self-declaration:
 *   "Was this work-related?" Yes → no penalty. No / auto-dismiss → penalty kept.
 */
export function DistractionToast({
  show,
  awaySeconds,
  onDismiss,
  onWorkRelated,
  autoDismissMs = 8000,
}: DistractionToastProps) {
  // Progress bar animation ref
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !barRef.current) return;

    // Animate the progress bar from 100 → 0 over autoDismissMs
    barRef.current.style.transition = "none";
    barRef.current.style.width = "100%";

    // Force reflow so the reset takes effect before we start animating
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    barRef.current.offsetWidth;

    barRef.current.style.transition = `width ${autoDismissMs}ms linear`;
    barRef.current.style.width = "0%";
  }, [show, autoDismissMs]);

  if (!show) return null;

  return (
    // Fixed posición — bottom-right, doesn't block content
    <div
      className="fixed bottom-6 right-6 z-[9999] w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-[#111] dark:bg-[#1a1a1a] border-2 border-[#ff3b00] text-[#f5f4ef] shadow-[6px_6px_0_0_#ff3b00] overflow-hidden">
        
        {/* Auto-dismiss countdown bar */}
        <div className="h-0.5 bg-[#ff3b00]/20">
          <div
            ref={barRef}
            className="h-full bg-[#ff3b00]"
            style={{ width: "100%" }}
          />
        </div>

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff3b00] shrink-0 mt-0.5" />
              <p className="text-xs font-black uppercase tracking-widest text-[#ff3b00]">
                Focus Break Detected
              </p>
            </div>
            {/* Silent dismiss (X) — counts as "No" */}
            <button
              onClick={onDismiss}
              className="text-[#f5f4ef]/40 hover:text-[#f5f4ef] transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm font-bold mb-4 leading-snug">
            You were away for{" "}
            <span className="text-[#ff3b00]">{awaySeconds}s</span>
            . Stay focused!
          </p>

          {/* Self-declaration prompt */}
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">
            Was this work-related?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onWorkRelated}
              className="flex items-center justify-center gap-1.5 h-9 border-2 border-[#f5f4ef]/30 text-xs font-black uppercase tracking-wider hover:bg-[#f5f4ef] hover:text-[#111] hover:border-[#f5f4ef] transition-colors"
            >
              <Briefcase className="w-3 h-3" />
              Yes
            </button>
            <button
              onClick={onDismiss}
              className="flex items-center justify-center gap-1.5 h-9 bg-[#ff3b00] border-2 border-[#ff3b00] text-xs font-black uppercase tracking-wider text-black hover:bg-[#ff3b00]/80 transition-colors"
            >
              <Zap className="w-3 h-3" />
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
