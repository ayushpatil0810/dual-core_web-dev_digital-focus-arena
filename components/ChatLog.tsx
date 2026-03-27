"use client";

import { useEffect, useRef } from "react";

export interface ChatMessage {
  id: string;
  emoji: string;
  userName: string;
  timestamp: number;
}

interface ChatLogProps {
  messages: ChatMessage[];
}

/**
 * ChatLog
 *
 * Displays a chronological log of emoji reactions sent to the room.
 * Auto-scrolls to the latest message.
 * Minimal, brutalist design fitting the app aesthetic.
 */
export function ChatLog({ messages }: ChatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="border-2 border-[#f5f4ef]/20 bg-[#0a0a0a] flex flex-col h-full">
      {/* Header */}
      <div className="border-b-2 border-[#f5f4ef]/20 px-4 py-3">
        <h3 className="font-heading font-black text-sm uppercase tracking-wider">
          Room Chat
        </h3>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-[#f5f4ef]/20 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="text-xs opacity-50 text-center py-8">
            No messages yet. Send an emoji to get started!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <span className="text-lg">{msg.emoji}</span>
              <span className="font-bold">{msg.userName}</span>
              <span className="opacity-50 ml-auto">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Format timestamp as HH:MM
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
