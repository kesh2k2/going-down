"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface HeavenlyGateProps {
  gateWrapperRef: React.RefObject<HTMLDivElement | null>;
  leftDoorRef: React.RefObject<HTMLDivElement | null>;
  rightDoorRef: React.RefObject<HTMLDivElement | null>;
  sealRef: React.RefObject<HTMLButtonElement | null>;
  lightBurstRef: React.RefObject<HTMLDivElement | null>;
  mistLeftRef: React.RefObject<HTMLDivElement | null>;
  mistRightRef: React.RefObject<HTMLDivElement | null>;
  mistCenterRef: React.RefObject<HTMLDivElement | null>;
  onOpen: () => void;
}

export default function HeavenlyGate({
  gateWrapperRef,
  leftDoorRef,
  rightDoorRef,
  sealRef,
  lightBurstRef,
  mistLeftRef,
  mistRightRef,
  mistCenterRef,
  onOpen,
}: HeavenlyGateProps) {
  return (
    <div
      ref={gateWrapperRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
      style={{ perspective: "1800px" }}
    >
      {/* 1. Divine Light Burst (දොර ඇරෙනකොට විහිදෙන එළිය) */}
      <div
        ref={lightBurstRef}
        className="pointer-events-none absolute inset-0 z-30 opacity-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(212,175,55,0.8) 35%, rgba(16,185,129,0.4) 60%, transparent 80%)",
        }}
      />

      {/* 2. Mist & Cloud Layers */}
      <div
        ref={mistCenterRef}
        className="pointer-events-none absolute inset-0 z-40 opacity-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(220,230,240,0.5) 50%, transparent 80%)",
        }}
      />
      <div ref={mistLeftRef} className="pointer-events-none absolute -left-1/4 top-0 h-full w-3/4 z-40 opacity-0 blur-2xl bg-white/30" />
      <div ref={mistRightRef} className="pointer-events-none absolute -right-1/4 top-0 h-full w-3/4 z-40 opacity-0 blur-2xl bg-white/30" />

      {/* =========================================================
          3. MAIN GATE STRUCTURE (Matching the Reference Image)
      ========================================================= */}
      <div className="relative flex w-full max-w-4xl h-[85vh] items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.9)]">

        {/* --- LEFT DOOR --- */}
        <div
          ref={leftDoorRef}
          style={{ transformOrigin: "left center" }}
          className="relative z-20 h-full w-1/2 bg-gradient-to-br from-[#1a1d24] via-[#111318] to-[#0a0c10] border-r-2 border-amber-500/70 shadow-[inset_-25px_0_60px_rgba(0,0,0,0.8)] flex items-center justify-end overflow-hidden"
        >
          {/* Gold Ornate Border Frame */}
          <div className="absolute inset-4 border border-amber-400/40 pointer-events-none">
            <div className="absolute inset-1.5 border border-amber-500/20" />
          </div>

          {/* Intricate Gold Filigree / Vine Pattern (CSS Background Pattern) */}
          <div
            className="absolute inset-6 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.4) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          {/* Simulated Classical Swirl Lines */}
          <div className="absolute inset-y-12 right-6 w-12 border-r-2 border-dashed border-amber-400/30 rounded-r-full pointer-events-none" />
        </div>

        {/* --- RIGHT DOOR --- */}
        <div
          ref={rightDoorRef}
          style={{ transformOrigin: "right center" }}
          className="relative z-20 h-full w-1/2 bg-gradient-to-bl from-[#1a1d24] via-[#111318] to-[#0a0c10] border-l-2 border-amber-500/70 shadow-[inset_25px_0_60px_rgba(0,0,0,0.8)] flex items-center justify-start overflow-hidden"
        >
          {/* Gold Ornate Border Frame */}
          <div className="absolute inset-4 border border-amber-400/40 pointer-events-none">
            <div className="absolute inset-1.5 border border-amber-500/20" />
          </div>

          {/* Intricate Gold Filigree / Vine Pattern */}
          <div
            className="absolute inset-6 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.4) 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          <div className="absolute inset-y-12 left-6 w-12 border-l-2 border-dashed border-amber-400/30 rounded-l-full pointer-events-none" />
        </div>

        {/* =========================================================
            4. CENTER EMERALD GEM & GOLDEN CREST (Exact to Image)
        ========================================================= */}
        <div className="absolute z-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
          {/* Gold Diamond Shield Framing */}
          <div className="relative w-24 h-36 sm:w-32 sm:h-48 border-2 border-amber-400 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.7)] rotate-0 clip-path-diamond">

            {/* Inner Dark Metal Plate */}
            <div className="absolute inset-1 bg-[#0f1115] flex items-center justify-center">

              {/* Glowing Emerald Green Crystal (Center Gem) */}
              <div className="w-10 h-16 sm:w-14 sm:h-24 bg-gradient-to-tr from-emerald-700 via-emerald-400 to-emerald-300 rotate-45 shadow-[0_0_35px_rgba(16,185,129,0.9)] border border-emerald-200 flex items-center justify-center">
                <div className="w-4 h-8 bg-white/40 rotate-45 blur-[1px]" />
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================
            5. CENTER SEAL BUTTON (TAP TO ENTER)
        ========================================================= */}
        <button
          ref={sealRef}
          onClick={onOpen}
          className="group absolute z-30 flex h-36 w-36 sm:h-40 sm:w-40 flex-col items-center justify-center rounded-full border-2 border-amber-300 bg-black/90 backdrop-blur-md text-amber-200 shadow-[0_0_50px_rgba(212,175,55,0.7)] transition-transform duration-500 hover:scale-110 cursor-pointer"
        >
          {/* Rotating Dashed Ring */}
          <span className="absolute inset-2 rounded-full border border-dashed border-amber-400/60 animate-[spin_20s_linear_infinite]" />

          <Sparkles className="w-6 h-6 text-amber-300 mb-1 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-300">
            Enter To
          </span>
          <span className="text-sm font-serif font-bold tracking-[0.25em] text-amber-300">
            HEAVEN
          </span>
        </button>

      </div>
    </div>
  );
}
