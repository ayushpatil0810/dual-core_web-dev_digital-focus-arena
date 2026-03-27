"use client";

import { Volume2, VolumeX, Wind, Waves, Cloud } from "lucide-react";
import { SoundMode } from "@/hooks/useAmbientSound";

interface AmbientSoundControlProps {
  mode: SoundMode;
  volume: number;
  onModeChange: (m: SoundMode) => void;
  onVolumeChange: (v: number) => void;
}

const MODES: { id: SoundMode; label: string; icon: React.ReactNode; title: string }[] = [
  { id: "off",   label: "Off",   icon: <VolumeX className="w-3.5 h-3.5" />, title: "No ambient sound" },
  { id: "white", label: "Focus", icon: <Wind     className="w-3.5 h-3.5" />, title: "White noise — airy, sharp focus" },
  { id: "pink",  label: "Rain",  icon: <Cloud    className="w-3.5 h-3.5" />, title: "Pink noise — gentle, like rainfall" },
  { id: "brown", label: "Deep",  icon: <Waves    className="w-3.5 h-3.5" />, title: "Brown noise — deep rumble, ocean-like" },
];

/**
 * AmbientSoundControl
 *
 * Compact control panel for the ambient noise synthesizer.
 * Shows 4 mode buttons + a volume slider, styled in the brutalist aesthetic.
 */
export function AmbientSoundControl({
  mode,
  volume,
  onModeChange,
  onVolumeChange,
}: AmbientSoundControlProps) {
  return (
    <div className="border-t-4 border-[#111]/10 dark:border-[#f5f4ef]/10 pt-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">
          Ambient Sound
        </h3>
        {mode !== "off" && (
          <Volume2 className="w-3.5 h-3.5 opacity-40 animate-pulse" />
        )}
      </div>

      {/* Mode toggle buttons */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {MODES.map(({ id, label, icon, title }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            title={title}
            className={`flex flex-col items-center gap-1 py-2 px-1 border-2 text-[10px] font-black uppercase tracking-wide transition-all ${
              mode === id
                ? "border-[#ff3b00] bg-[#ff3b00] text-black"
                : "border-[#111]/20 dark:border-[#f5f4ef]/20 hover:border-[#111]/60 dark:hover:border-[#f5f4ef]/60"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Volume slider — only visible when a mode is active */}
      {mode !== "off" && (
        <div className="flex items-center gap-3">
          <VolumeX className="w-3 h-3 opacity-40 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 accent-[#ff3b00] cursor-pointer"
            aria-label="Ambient volume"
          />
          <Volume2 className="w-3 h-3 opacity-40 shrink-0" />
        </div>
      )}
    </div>
  );
}
