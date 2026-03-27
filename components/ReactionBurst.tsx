"use client";

import { useEffect, useRef } from "react";

interface ActiveReaction {
  id: string;
  emoji: string;
  x: number; // random horizontal offset (%)
}

interface ReactionBurstProps {
  reactions: ActiveReaction[];
}

/**
 * ReactionBurst
 *
 * Renders floating emoji animations on top of a member card.
 * Each emoji floats upward and fades out over ~1.8s.
 * Uses a CSS animation defined in globals.css: `reaction-float`.
 *
 * Usage: Mount inside a `position: relative` card container.
 */
export function ReactionBurst({ reactions }: ReactionBurstProps) {
  if (reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {reactions.map((r) => (
        <span
          key={r.id}
          className="absolute bottom-2 text-2xl animate-reaction-float"
          style={{ left: `${r.x}%` }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

// ─── Reaction Picker ────────────────────────────────────────────────────────

const REACTION_EMOJIS = ["👍", "🔥", "💪", "⚡", "🎯"];

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
}

/**
 * ReactionPicker
 *
 * A small row of emoji buttons.
 * Click one to send a reaction to that member.
 */
export function ReactionPicker({ onReact }: ReactionPickerProps) {
  return (
    <div className="flex gap-1 bg-[#111] border-2 border-[#f5f4ef]/20 px-2 py-1 shadow-lg animate-in fade-in zoom-in-95 duration-150">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={(e) => {
            e.stopPropagation();
            onReact(emoji);
          }}
          className="text-2xl hover:scale-125 transition-transform active:scale-95 px-1 py-1 cursor-pointer"
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
