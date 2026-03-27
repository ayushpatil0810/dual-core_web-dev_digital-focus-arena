import { useEffect, useRef, useState, useCallback } from "react";

export type SoundMode = "off" | "white" | "brown" | "pink";

// Noise generation constants
const BUFFER_SIZE = 4096;

interface AmbientSoundState {
  mode: SoundMode;
  volume: number; // 0–1
  setMode: (m: SoundMode) => void;
  setVolume: (v: number) => void;
}

/**
 * useAmbientSound
 *
 * Generates ambient noise entirely via the Web Audio API — no external
 * CDN, no network requests, works completely offline.
 *
 * Modes:
 *  - white → equal energy across all frequencies (airy/hissing)
 *  - pink  → -3dB/octave roll-off (balanced, like gentle rain)
 *  - brown → -6dB/octave roll-off (deep rumble, like thunder/ocean)
 */
export function useAmbientSound(): AmbientSoundState {
  const [mode, setModeState] = useState<SoundMode>("off");
  const [volume, setVolumeState] = useState(0.4);

  // Web Audio API graph nodes held in refs to survive re-renders
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<ScriptProcessorNode | null>(null);

  // Pink-noise state (IIR filter coefficients — Paul Kellet's pink noise)
  const pinkNoiseState = useRef({ b0: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, b6: 0 });
  // Brown-noise state
  const brownNoiseState = useRef({ lastOut: 0 });

  // ─── Tear down current audio graph ───────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.onaudioprocess = null;
        sourceRef.current.disconnect();
      } catch (_) { /* already disconnected */ }
      sourceRef.current = null;
    }
  }, []);

  // ─── Build audio graph for the chosen mode ───────────────────────────────
  const startAudio = useCallback((newMode: SoundMode, vol: number) => {
    if (newMode === "off") { stopAudio(); return; }

    // Create / resume context on user gesture (browser autoplay policy)
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Create / reuse gain node
    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.connect(ctx.destination);
    }
    gainRef.current.gain.setValueAtTime(vol, ctx.currentTime);

    stopAudio(); // disconnect previous source if any

    // ScriptProcessor generates noise sample-by-sample
    // (deprecated but still universally supported; AudioWorklet would be ideal in production)
    const node = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);
    const pink = pinkNoiseState.current;
    const brown = brownNoiseState.current;

    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < BUFFER_SIZE; i++) {
        const white = Math.random() * 2 - 1;

        if (newMode === "white") {
          output[i] = white * 0.5;

        } else if (newMode === "pink") {
          // Paul Kellet's refined pink noise algorithm
          pink.b0 = 0.99886 * pink.b0 + white * 0.0555179;
          pink.b1 = 0.99332 * pink.b1 + white * 0.0750759;
          pink.b2 = 0.96900 * pink.b2 + white * 0.1538520;
          pink.b3 = 0.86650 * pink.b3 + white * 0.3104856;
          pink.b4 = 0.55000 * pink.b4 + white * 0.5329522;
          pink.b5 = -0.7616 * pink.b5 - white * 0.0168980;
          output[i] = (pink.b0 + pink.b1 + pink.b2 + pink.b3 + pink.b4 + pink.b5 + pink.b6 + white * 0.5362) * 0.11;
          pink.b6 = white * 0.115926;

        } else if (newMode === "brown") {
          // Brown noise: integrate white noise
          const next = (brown.lastOut + 0.02 * white) / 1.02;
          brown.lastOut = next;
          output[i] = next * 3.5;
        }
      }
    };

    node.connect(gainRef.current);
    sourceRef.current = node;
  }, [stopAudio]);

  // ─── React to mode/volume changes ────────────────────────────────────────
  useEffect(() => {
    if (mode === "off") {
      stopAudio();
    } else {
      startAudio(mode, volume);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Volume-only change — just update the gain node without rebuilding
  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setValueAtTime(volume, ctxRef.current.currentTime);
    }
  }, [volume]);

  // ─── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAudio();
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
    };
  }, [stopAudio]);

  const setMode = useCallback((m: SoundMode) => setModeState(m), []);
  const setVolume = useCallback((v: number) => setVolumeState(v), []);

  return { mode, volume, setMode, setVolume };
}
