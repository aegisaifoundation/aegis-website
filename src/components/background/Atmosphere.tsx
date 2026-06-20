"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function Atmosphere() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  const startSynth = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2.0);
    mainGain.connect(ctx.destination);
    gainNodeRef.current = mainGain;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, ctx.currentTime);
    filter.Q.setValueAtTime(1.0, ctx.currentTime);
    filter.connect(mainGain);

    const freqs = [65.41, 98.00, 130.81]; // C2, G2, C3
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 1 ? "triangle" : "sawtooth";
      
      // Detune slightly for an organic, chorus pad texture
      const detuneAmount = (idx - 1) * 8; 
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detuneAmount, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(filter);

      osc.start();
      oscs.push(osc);
    });

    oscsRef.current = oscs;

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(60, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    lfo.start();
    oscs.push(lfo);
  };

  const stopSynth = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      const gain = gainNodeRef.current;
      
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);

      setTimeout(() => {
        oscsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {}
        });
        oscsRef.current = [];
        try {
          ctx.close();
        } catch (e) {}
        audioCtxRef.current = null;
        gainNodeRef.current = null;
      }, 1400);
    }
  };

  const toggleAtmosphere = () => {
    if (isPlaying) {
      stopSynth();
      setIsPlaying(false);
    } else {
      startSynth();
      setIsPlaying(true);
    }
  };

  return (
    <button
      onClick={toggleAtmosphere}
      className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full btn-glass text-white/50 hover:text-white transition-all duration-350 shadow-xl flex items-center justify-center cursor-pointer"
      title={isPlaying ? "Disable Atmosphere" : "Enable Atmosphere"}
      aria-label="Toggle Atmosphere"
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 animate-pulse text-[#7DD3FC]" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  );
}
