"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import gsap from "gsap";
import { motion, type Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Crown,
  Shirt,
  Ticket,
  Sparkles,
} from "lucide-react";
import { Cormorant_Garamond, Jost } from "next/font/google";

/* ------------------------------------------------------------------ */
/*  Fonts                                                              */
/* ------------------------------------------------------------------ */
const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const body = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */
type CloudSpec = [x: number, y: number, size: number];

const LEFT_BANK: CloudSpec[] = [
  [-4, 58, 26], [2, 70, 34], [10, 80, 38], [-2, 88, 40],
  [16, 92, 34], [6, 100, 44], [22, 98, 28],
];
const RIGHT_BANK: CloudSpec[] = LEFT_BANK.map(
  ([x, y, s], i) => [100 - x, y + (i % 2 === 0 ? -2 : 2), s * 0.92] as CloudSpec
);
const FRONT_BANK: CloudSpec[] = [
  [30, 106, 30], [42, 112, 28], [50, 108, 36], [58, 112, 28], [70, 106, 30],
];
const PAGE_CLOUDS: CloudSpec[] = [
  [6, 96, 40], [24, 104, 46], [42, 98, 40], [60, 106, 48], [78, 100, 42], [94, 96, 38],
];

const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * 30 * Math.PI) / 180;
  const f = (n: number) => n.toFixed(2);
  return {
    x1: f(100 + 84 * Math.cos(a)), y1: f(100 + 84 * Math.sin(a)),
    x2: f(100 + 94 * Math.cos(a)), y2: f(100 + 94 * Math.sin(a)),
  };
});

const POEM_STANZAS: string[][] = [
  [
    "Tonight the sky feels close to us,",
    "Like heaven has come down to earth.",
    "For our seniors, our guiding stars,",
    "We celebrate your love and worth.",
  ],
  [
    "Music will play, laughter will flow,",
    "Memories will shine like stars in the sky.",
    "This is not a goodbye forever,",
    "It is a promise that we will not say goodbye.",
  ],
  [
    "One Night. A Thousand Memories. One Valinor.",
    "A heaven we made together, you and me.",
    "Seniors, juniors, one family,",
    "Forever in our hearts you will be.",
  ],
];

const EVENT_TARGET = new Date("2026-11-21T18:30:00+05:30").getTime();

type Mote = { id: number; left: number; top: number; size: number; delay: number; dur: number; jade: boolean };

/* ------------------------------------------------------------------ */
/*  Isolated Components (Performance Optimization)                     */
/* ------------------------------------------------------------------ */
const Cloud = memo(function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <span
      className="absolute block rounded-full"
      style={{
        left: `${x}%`, top: `${y}%`,
        width: `calc(${s}vmin + ${s * 0.25}vw)`,
        aspectRatio: "1.35 / 1", transform: "translate(-50%, -50%)",
        background: "radial-gradient(ellipse at 40% 32%, #ffffff 0%, #f6f4ee 38%, #dcdad2 62%, rgba(210,208,200,0) 74%)",
        filter: "blur(3px)",
      }}
    />
  );
});

const CloudBank = memo(function CloudBank({ clouds, bankRef, origin, z = 20 }: {
  clouds: CloudSpec[]; bankRef: React.Ref<HTMLDivElement>; origin: string; z?: number;
}) {
  return (
    <div ref={bankRef} className="hg-bank pointer-events-none absolute inset-0"
      style={{ transformOrigin: origin, zIndex: z }} aria-hidden="true">
      {clouds.map(([x, y, s], i) => <Cloud key={i} x={x} y={y} s={s} />)}
    </div>
  );
});

const Pillar = memo(function Pillar({ mirror = false }: { mirror?: boolean }) {
  return (
    <g transform={mirror ? "translate(600 0) scale(-1 1)" : undefined}>
      <rect x="18" y="534" width="94" height="26" fill="url(#hg-stone-v)" />
      <rect x="28" y="516" width="76" height="20" fill="url(#hg-stone-v)" />
      <rect x="34" y="196" width="64" height="322" fill="url(#hg-stone-h)" />
      <rect x="14" y="170" width="104" height="28" fill="url(#hg-stone-v)" />
      <rect x="22" y="154" width="88" height="18" fill="url(#hg-stone-v)" />
      <rect x="14" y="196" width="104" height="3" fill="#d9b640" opacity="0.8" />
      <path d="M46,500 V262 Q66,222 86,262 V500 Z" fill="rgba(18,24,10,0.6)" stroke="url(#hg-gold)" strokeWidth="1.5" />
      <g className="hg-jade" filter="url(#hg-glow)">
        <polygon points="66,262 82,340 66,430 50,340" fill="url(#hg-jade)" />
        <polygon points="66,296 74,340 66,392 58,340" fill="#f6ffd8" />
      </g>
      <polygon className="hg-jade" points="66,452 72,466 66,480 60,466" fill="url(#hg-jade)" filter="url(#hg-glow)" />
    </g>
  );
});

const Filigree = memo(function Filigree({ mirror = false }: { mirror?: boolean }) {
  return (
    <svg viewBox="0 0 150 450" preserveAspectRatio="none" aria-hidden="true"
      className="absolute inset-0 h-full w-full" style={mirror ? { transform: "scaleX(-1)" } : undefined}
      fill="none" stroke="#d3a82a" strokeLinecap="round">
      <path d="M14,446 V150 A136,136 0 0 1 150,14" strokeWidth="2" />
      <path d="M26,446 V150 A124,124 0 0 1 150,26" strokeWidth="1" opacity="0.5" />
      <path d="M26,404 H150" strokeWidth="1" opacity="0.4" />
      <path d="M48,436 C48,392 96,374 88,324 C80,272 34,262 50,208 C60,176 98,168 112,132" strokeWidth="1.8" />
      <path d="M48,436 C36,430 30,418 38,410 C46,404 54,410 52,418" strokeWidth="1.5" />
      <path d="M88,324 C112,318 124,296 118,276 C102,284 90,302 88,324 Z" fill="rgba(212,175,55,0.14)" strokeWidth="1.4" />
      <path d="M50,208 C34,206 30,190 36,176 C46,182 52,194 50,208 Z" fill="rgba(212,175,55,0.14)" strokeWidth="1.4" />
      <path d="M112,132 C128,126 136,108 130,90 C116,98 108,114 112,132 Z" fill="rgba(212,175,55,0.14)" strokeWidth="1.4" />
      <path d="M70,356 C58,350 56,338 62,332" strokeWidth="1.2" opacity="0.8" />
      <circle cx="122" cy="62" r="2.2" fill="#d3a82a" stroke="none" />
      <circle cx="104" cy="44" r="1.6" fill="#d3a82a" stroke="none" />
    </svg>
  );
});

const SandTimer = memo(function SandTimer() {
  return (
    <div className="relative h-20 w-14 shrink-0 sm:h-24 sm:w-16" aria-hidden="true">
      <svg viewBox="0 0 80 120" className="h-full w-full drop-shadow-[0_4px_12px_rgba(201,162,39,0.25)]">
        <defs>
          <linearGradient id="hg-sand-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1a8" /><stop offset="1" stopColor="#c9a227" />
          </linearGradient>
        </defs>
        <path d="M15,18 Q15,60 40,60 Q65,60 65,18 Z" fill="rgba(255,255,255,0.35)" stroke="#d3a82a" strokeWidth="0.8" />
        <path d="M15,102 Q15,60 40,60 Q65,60 65,102 Z" fill="rgba(255,255,255,0.35)" stroke="#d3a82a" strokeWidth="0.8" />
        <path d="M22,24 Q22,55 40,57 Q58,55 58,24 Z" fill="url(#hg-sand-grad)" className="hg-sand-top" />
        <path d="M22,96 Q22,65 40,63 Q58,65 58,96 Z" fill="url(#hg-sand-grad)" />
        <line x1="40" y1="57" x2="40" y2="63" stroke="#e9c85a" strokeWidth="1.5" className="hg-stream" />
        <rect x="6" y="12" width="68" height="7" rx="2" fill="url(#hg-sand-grad)" />
        <rect x="6" y="101" width="68" height="7" rx="2" fill="url(#hg-sand-grad)" />
      </svg>
    </div>
  );
});

/* Isolated Countdown to prevent whole page re-renders every second */
const CountdownDisplay = memo(function CountdownDisplay() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, EVENT_TARGET - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-6">
      {[
        { label: "Days", value: time.days },
        { label: "Hours", value: time.hours },
        { label: "Minutes", value: time.minutes },
        { label: "Seconds", value: time.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex min-w-[70px] flex-col items-center rounded-2xl border border-[#c9a227]/30 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-md sm:min-w-[90px]">
          <span className={`${display.className} text-3xl font-semibold tabular-nums text-[#8c6a12] sm:text-4xl`}>
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-[#6b6450] sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.3 } },
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
export default function HeavenlyInvitation() {
  const [isOpened, setIsOpened] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [motes, setMotes] = useState<Mote[]>([]);
  const [year, setYear] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const gateWrapperRef = useRef<HTMLDivElement>(null);
  const gateFrameRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const lockGroupRef = useRef<HTMLDivElement>(null);
  const lockGlowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const keyRef = useRef<SVGGElement>(null);
  const boltLRef = useRef<SVGGElement>(null);
  const boltRRef = useRef<SVGGElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const mistRef = useRef<HTMLDivElement>(null);
  const leftBankRef = useRef<HTMLDivElement>(null);
  const rightBankRef = useRef<HTMLDivElement>(null);
  const frontBankRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null); // Ref for IntersectionObserver

  const startedRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const idleRef = useRef<gsap.core.Tween[]>([]);

  const unlockSoundRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);

  const { scrollY } = useScroll();
  const cloudsParallax = useTransform(scrollY, [0, 1000], [0, -80]);

  /* ---- Initial Mount & Preload Image ---- */
  useEffect(() => {
    setYear(new Date().getFullYear());

    // Preload the university image for instant canvas generation later
    const img = new Image();
    img.src = "/uni.png";

    setMotes(
      Array.from({ length: 34 }, (_, i) => ({
        id: i, left: Math.random() * 100, top: Math.random() * 80,
        size: 2 + Math.random() * 3, delay: Math.random() * 6,
        dur: 6 + Math.random() * 6, jade: Math.random() < 0.35,
      }))
    );

    return () => {
      unlockSoundRef.current?.pause();
      ambientSoundRef.current?.pause();
    };
  }, []);

  /* ---- Optimized Auto-mute (Intersection Observer) ---- */
  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ambientSoundRef.current && !ambientSoundRef.current.paused) {
          gsap.to(ambientSoundRef.current, {
            volume: 0,
            duration: 2,
            onComplete: () => {
              if (ambientSoundRef.current) ambientSoundRef.current.pause();
              setIsMuted(true);
            }
          });
        }
      },
      { threshold: 0.1 } // Triggers when 10% of footer becomes visible
    );

    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  /* ---- GSAP Hero Reveal ---- */
  useEffect(() => {
    if (!isOpened || !heroRef.current) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set([".reveal-milestone", ".reveal-poem-title", ".poem-char", ".reveal-btn"], { opacity: 1, filter: "none", y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });

      tl.fromTo(".reveal-milestone",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.2, ease: "power3.out" }
      );

      tl.to(".reveal-poem-title", { opacity: 1, duration: 0.6, ease: "power2.out" }, "+=0.2");

      tl.to(".poem-char",
        { opacity: 1, duration: 0.01, stagger: { each: 0.018, from: "start" }, ease: "none" },
        "+=0.2"
      );

      tl.fromTo(".reveal-btn",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "+=0.4"
      );

    }, heroRef);

    return () => { ctx.revert(); };
  }, [isOpened]);

  /* ---- Scroll to Details ---- */
  useEffect(() => {
    if (showDetails) {
      setTimeout(() => {
        const detailsSection = document.getElementById("invitation-details");
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [showDetails]);

  /* ---- Gate Idle Animations ---- */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      idleRef.current = [
        gsap.to(ringRef.current, { rotation: 360, svgOrigin: "100 100", duration: 40, ease: "none", repeat: -1 }),
        gsap.to(lockGlowRef.current, { opacity: 0.95, scale: 1.12, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 }),
      ];
      gsap.to(".hg-jade", { opacity: 0.55, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.3, from: "random" } });
      gsap.to(".hg-bank", { y: 8, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.8 });
    }, containerRef);
    ctxRef.current = ctx;

    return () => { ctx.revert(); tlRef.current?.kill(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = gateGone ? "" : "hidden";
    mainRef.current?.toggleAttribute("inert", !gateGone);
    return () => { document.body.style.overflow = ""; };
  }, [gateGone]);

  const finish = () => {
    ctxRef.current?.revert();
    setGateGone(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const downloadTicket = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1000, H = 600;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.src = "/uni.png";

    img.onload = () => {
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#fdfbf3");
      bg.addColorStop(0.5, "#f5f2e8");
      bg.addColorStop(1, "#e8e2d0");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 600);
      glow.addColorStop(0, "rgba(233,200,90,0.35)");
      glow.addColorStop(1, "rgba(233,200,90,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, W - 40, H - 40);
      ctx.strokeStyle = "rgba(201,162,39,0.55)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(35, 35, W - 70, H - 70);

      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(450, 35);
      ctx.lineTo(450, H - 35);
      ctx.stroke();
      ctx.setLineDash([]);

      const imgWidth = 360;
      const imgHeight = (img.height / img.width) * imgWidth;
      ctx.drawImage(img, 45, H / 2 - imgHeight / 2, imgWidth, imgHeight);

      const textX = 725;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#5e4508";
      ctx.font = "bold 72px Georgia, serif";
      ctx.fillText("VALINOR '26", textX, 130);

      ctx.fillStyle = "#8c6a12";
      ctx.font = "italic 26px Georgia, serif";
      ctx.fillText("A Night Where Legends Say Goodbye", textX, 180);

      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(textX - 180, 215);
      ctx.lineTo(textX + 180, 215);
      ctx.stroke();

      const c1 = 600, c2 = 850, r1 = 280, r2 = 370;

      ctx.font = "italic 20px Georgia, serif";
      ctx.fillStyle = "#8c6a12";
      ctx.fillText("DATE", c1, r1);
      ctx.fillText("TIME", c2, r1);
      ctx.fillText("VENUE", c1, r2);
      ctx.fillText("DRESS CODE", c2, r2);

      ctx.font = "bold 28px Georgia, serif";
      ctx.fillStyle = "#2a2418";
      ctx.fillText("21st Nov 2026", c1, r1 + 35);
      ctx.fillText("6:30 PM", c2, r1 + 35);
      ctx.fillText("AVARAGIRA", c1, r2 + 35);
      ctx.fillText("White / Black", c2, r2 + 35);

      ctx.font = "italic 22px Georgia, serif";
      ctx.fillStyle = "#8c6a12";
      ctx.fillText("One Night. A Thousand Memories.", textX, 480);

      ctx.font = "14px Jost, sans-serif";
      ctx.fillStyle = "#a09579";
      ctx.fillText("Presented by Batch 2022 | In honour of Batch 2021", textX, 520);

      const link = document.createElement("a");
      link.download = "valinor-26-ticket.png";
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const handleUnlock = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    idleRef.current.forEach((t) => t.kill());
    idleRef.current = [];

    if (!isMuted) {
      try {
        const unlockSound = new Audio("/audio/unlock.mp3");
        unlockSound.volume = 0.85;
        unlockSoundRef.current = unlockSound;
        unlockSound.play().catch(() => {});
      } catch { /* ignore */ }

      try {
        const ambient = new Audio("/audio/ambient.mp3");
        ambient.loop = true;
        ambient.volume = 0;
        ambientSoundRef.current = ambient;

        window.setTimeout(() => {
          if (ambientSoundRef.current !== ambient) return;
          ambient.play().then(() => {
            gsap.to(ambient, { volume: 0.55, duration: 3.5, ease: "power1.inOut" });
          }).catch(() => {});
        }, 1500);
      } catch { /* ignore */ }
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const tl = gsap.timeline({ onComplete: finish });
      tlRef.current = tl;
      tl.to(mistRef.current, { opacity: 1, duration: 0.6 })
        .call(() => setIsOpened(true))
        .to(gateWrapperRef.current, { opacity: 0, duration: 0.6 });
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    tlRef.current = tl;

    tl
      .to(hintRef.current, { opacity: 0, duration: 0.4 }, 0)
      .to(keyRef.current, { rotation: 90, svgOrigin: "100 104", duration: 0.55, ease: "power2.inOut" }, 0)
      .to(ringRef.current, { rotation: "+=300", svgOrigin: "100 100", duration: 1.4, ease: "power3.inOut" }, 0)
      .to(boltLRef.current, { x: 30, duration: 0.45, ease: "power2.out" }, 0.5)
      .to(boltRRef.current, { x: -30, duration: 0.45, ease: "power2.out" }, 0.5)
      .to(lockGlowRef.current, { opacity: 1, scale: 2.4, duration: 0.8, ease: "power2.out" }, 0.55)
      .to(lockGroupRef.current, { scale: 1.35, opacity: 0, duration: 0.6, ease: "power2.in" }, 1.0)
      .fromTo(seamRef.current, { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.5, ease: "power2.out" }, 1.0)
      .to(lightRef.current, { opacity: 1, scale: 1.35, duration: 1.2, ease: "power2.out" }, 1.1)
      .addLabel("doors", 1.4)
      .to(leftDoorRef.current, { rotateY: 108, duration: 2.2, ease: "power3.inOut" }, "doors")
      .to(rightDoorRef.current, { rotateY: -108, duration: 2.2, ease: "power3.inOut" }, "doors")
      .to([leftDoorRef.current, rightDoorRef.current], { opacity: 0, duration: 0.7, ease: "power1.in" }, "doors+=1.6")
      .to(seamRef.current, { opacity: 0, duration: 0.8 }, "doors+=0.9")
      .to(gateFrameRef.current, { scale: 1.6, duration: 3.2, ease: "power2.in" }, "doors")
      .to(leftBankRef.current, { xPercent: -35, scale: 1.5, duration: 2.8, ease: "power2.in" }, "doors+=0.2")
      .to(rightBankRef.current, { xPercent: 35, scale: 1.5, duration: 2.8, ease: "power2.in" }, "doors+=0.2")
      .to(frontBankRef.current, { scale: 1.7, yPercent: -8, duration: 2.8, ease: "power2.in" }, "doors+=0.2")
      .fromTo(mistRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1.4, duration: 1.6, ease: "power1.in" }, "doors+=1.1")
      .call(() => setIsOpened(true), undefined, "doors+=2.3")
      .set(gateWrapperRef.current, { pointerEvents: "none" }, "doors+=2.7")
      .to(gateWrapperRef.current, { opacity: 0, duration: 1.4, ease: "power1.inOut" }, "doors+=2.7");
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (unlockSoundRef.current) unlockSoundRef.current.muted = next;
    if (ambientSoundRef.current) ambientSoundRef.current.muted = next;
  };

  return (
    <div
      ref={containerRef}
      className={`${body.className} relative min-h-[100svh] overflow-x-hidden bg-[#f5f2e8] text-[#2a2418] selection:bg-[#c9a227]/30`}
    >
      <style>{`
        @keyframes hg-float {
          0%, 100% { transform: translateY(0); opacity: .3; }
          50% { transform: translateY(-18px); opacity: 1; }
        }
        .hg-mote { animation: hg-float var(--d, 8s) ease-in-out infinite; }
        @keyframes hg-hint {
          0%, 100% { opacity: .55; }
          50% { opacity: 1; }
        }
        .hg-hint { animation: hg-hint 2.6s ease-in-out infinite; }
        @keyframes hg-stream-pulse {
          0%, 100% { opacity: .35; }
          50% { opacity: 1; }
        }
        .hg-stream { animation: hg-stream-pulse 1.4s ease-in-out infinite; }
        @keyframes hg-sand-fall {
          0%   { transform: scaleY(1); opacity: 1; }
          70%  { transform: scaleY(0.35); opacity: 0.9; }
          100% { transform: scaleY(0.1); opacity: 0; }
        }
        .hg-sand-top {
          transform-origin: 50% 100%;
          transform-box: fill-box;
          animation: hg-sand-fall 8s ease-in infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hg-mote { animation: none; opacity: .6; }
          .hg-hint { animation: none; }
          .hg-stream { animation: none; opacity: .6; }
          .hg-sand-top { animation: none; }
        }
      `}</style>

      {/* GATE OVERLAY */}
            {!gateGone && (
              <div
                ref={gateWrapperRef}
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
                style={{ background: "radial-gradient(ellipse at 50% 38%, #fcf9ee 0%, #e9e7df 45%, #c8c9c5 100%)" }}
              >
                <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
                  {motes.map((m) => (
                    <span
                      key={m.id}
                      className="hg-mote absolute rounded-full"
                      style={{
                        left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size,
                        background: m.jade ? "#b9ff3a" : "#f0cf6a",
                        boxShadow: m.jade ? "0 0 8px 2px rgba(150,230,40,.8)" : "0 0 8px 2px rgba(240,200,90,.8)",
                        animationDelay: `${m.delay}s`, "--d": `${m.dur}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                <CloudBank clouds={LEFT_BANK} bankRef={leftBankRef} origin="0% 100%" />
                <CloudBank clouds={RIGHT_BANK} bankRef={rightBankRef} origin="100% 100%" />

                <div
                  ref={gateFrameRef}
                  className="relative z-10"
                  style={{ width: "min(120vw, calc(82vh * 15 / 16))", aspectRatio: "15 / 16", transformOrigin: "50% 58%" }}
                >
                  {/* VALINOR '26 Title at the top of the gate */}
                  <p className={`${display.className} absolute inset-x-0 -top-16 z-[30] text-center text-3xl font-bold tracking-[0.2em] text-[#8c6a12] drop-shadow-md sm:text-4xl`}>
                    VALINOR '26
                  </p>

                  <div
                    className="absolute left-1/4 top-[17.1875%] z-[1] h-[70.3125%] w-1/2 overflow-hidden"
                    style={{
                      borderRadius: "50% 50% 0 0 / 33.333% 33.333% 0 0",
                      background: "radial-gradient(ellipse at 50% 55%, #fffdf0 0%, #f4ecc8 38%, #dcd9cf 80%)",
                    }}
                  >
                    <div ref={lightRef} className="absolute inset-0 opacity-0"
                      style={{ background: "radial-gradient(circle at 50% 55%, #ffffff 0%, rgba(255,244,190,.95) 30%, rgba(255,236,150,0) 70%)" }} />
                  </div>

                  <div className="absolute left-1/4 top-[17.1875%] z-[2] h-[70.3125%] w-1/2" style={{ perspective: "1600px" }}>
                    <div ref={leftDoorRef} className="absolute inset-y-0 left-0 w-1/2 overflow-hidden border-r-2 border-[#d9b640]/80"
                      style={{
                        transformOrigin: "left center",
                        borderTopLeftRadius: "100% 33.333%",
                        background: "linear-gradient(100deg, rgba(255,255,255,.55) 0%, rgba(247,243,228,.8) 60%, rgba(255,246,200,.92) 100%)",
                      }}>
                      <Filigree />
                    </div>
                    <div ref={rightDoorRef} className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l-2 border-[#d9b640]/80"
                      style={{
                        transformOrigin: "right center",
                        borderTopRightRadius: "100% 33.333%",
                        background: "linear-gradient(260deg, rgba(255,255,255,.55) 0%, rgba(247,243,228,.8) 60%, rgba(255,246,200,.92) 100%)",
                      }}>
                      <Filigree mirror />
                    </div>

                    <div ref={seamRef} className="pointer-events-none absolute top-0 z-[4] h-full opacity-0"
                      style={{
                        left: "calc(50% - 5px)", width: 10,
                        background: "linear-gradient(to bottom, rgba(255,255,255,0), #fff6c8 15%, #ffffff 50%, #fff6c8 85%, rgba(255,255,255,0))",
                        boxShadow: "0 0 30px 12px rgba(255,236,150,.8)", filter: "blur(1.5px)",
                      }} />

                    <div className="absolute left-1/2 top-[50%] z-[5] w-[64%] -translate-x-1/2 -translate-y-1/2">
                      <div ref={lockGroupRef} className="relative">
                        <div ref={lockGlowRef} className="pointer-events-none absolute rounded-full opacity-60"
                          style={{ inset: "-25%", background: "radial-gradient(circle, rgba(255,246,196,.95) 0%, rgba(233,200,90,.45) 38%, rgba(233,200,90,0) 68%)" }} />
                        <button type="button" onClick={handleUnlock} aria-label="Unlock the heavenly gate"
                          className="relative block aspect-square w-full cursor-pointer rounded-full transition-[filter] duration-300 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fd114]">
                          <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible" aria-hidden="true">
                            <defs>
                              <linearGradient id="lk-gold" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#fff1a8" /><stop offset="0.5" stopColor="#e9c85a" /><stop offset="1" stopColor="#b58a1a" />
                              </linearGradient>
                              <linearGradient id="lk-pearl" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#efe6c4" />
                              </linearGradient>
                              <radialGradient id="lk-jade">
                                <stop offset="0" stopColor="#f4ffd0" /><stop offset="0.45" stopColor="#b9ff3a" /><stop offset="1" stopColor="#6fdc12" />
                              </radialGradient>
                              <filter id="lk-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3.5" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                              </filter>
                            </defs>

                            <g ref={ringRef}>
                              <circle cx="100" cy="100" r="92" fill="none" stroke="#d3a82a" strokeWidth="1.2" strokeDasharray="2 6" />
                              <circle cx="100" cy="100" r="84" fill="none" stroke="#d3a82a" strokeWidth="1" opacity="0.5" />
                              {TICKS.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#d3a82a" strokeWidth="2" />)}
                            </g>

                            <g ref={boltLRef}>
                              <rect x="0" y="94" width="54" height="12" rx="3" fill="url(#lk-gold)" />
                              <line x1="8" y1="100" x2="44" y2="100" stroke="#8a6612" strokeWidth="1" opacity="0.6" />
                            </g>
                            <g ref={boltRRef}>
                              <rect x="146" y="94" width="54" height="12" rx="3" fill="url(#lk-gold)" />
                              <line x1="156" y1="100" x2="192" y2="100" stroke="#8a6612" strokeWidth="1" opacity="0.6" />
                            </g>

                            <g filter="url(#lk-glow)">
                              <polygon points="100,18 152,100 100,182 48,100" fill="url(#lk-pearl)" stroke="url(#lk-gold)" strokeWidth="4" />
                              <polygon points="100,44 130,100 100,156 70,100" fill="rgba(255,255,255,.35)" stroke="#d3a82a" strokeWidth="1.5" />
                            </g>

                            <g className="hg-jade" filter="url(#lk-glow)">
                              <polygon points="100,48 108,62 100,76 92,62" fill="url(#lk-jade)" />
                              <polygon points="100,128 105,138 100,148 95,138" fill="url(#lk-jade)" />
                            </g>

                            <g ref={keyRef}>
                              <circle cx="100" cy="98" r="9" fill="#3a2e08" />
                              <path d="M96,102 L104,102 L108,126 L92,126 Z" fill="#3a2e08" />
                            </g>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <svg viewBox="0 0 600 640" className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-visible" aria-hidden="true">
                    <defs>
                      <linearGradient id="hg-stone-v" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#6d6c62" /><stop offset="1" stopColor="#34332e" />
                      </linearGradient>
                      <linearGradient id="hg-stone-h" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#5b5a52" /><stop offset="0.5" stopColor="#3f3e38" /><stop offset="1" stopColor="#55544c" />
                      </linearGradient>
                      <linearGradient id="hg-gold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#fff1a8" /><stop offset="0.5" stopColor="#e9c85a" /><stop offset="1" stopColor="#b58a1a" />
                      </linearGradient>
                      <radialGradient id="hg-jade">
                        <stop offset="0" stopColor="#f4ffd0" /><stop offset="0.45" stopColor="#b9ff3a" /><stop offset="1" stopColor="#6fdc12" />
                      </radialGradient>
                      <radialGradient id="hg-star">
                        <stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor="#fff1a8" /><stop offset="1" stopColor="#e9c85a" />
                      </radialGradient>
                      <filter id="hg-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="4" result="b" />
                        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>

                    <path d="M20,260 A280,250 0 0 1 580,260" fill="none" stroke="rgba(255,255,255,.95)" strokeWidth="1.2" />
                    <path d="M52,260 A248,222 0 0 1 548,260" fill="none" stroke="rgba(233,200,90,.75)" strokeWidth="1" />
                    <ellipse cx="300" cy="610" rx="230" ry="16" fill="rgba(240,205,110,.28)" filter="url(#hg-glow)" />
                    <rect x="120" y="560" width="360" height="10" fill="url(#hg-stone-v)" />
                    <rect x="104" y="570" width="392" height="10" fill="url(#hg-stone-v)" />
                    <rect x="88" y="580" width="424" height="10" fill="url(#hg-stone-v)" />
                    <rect x="120" y="560" width="360" height="2" fill="#e9c85a" opacity="0.7" />
                    <ellipse cx="300" cy="561" rx="150" ry="5" fill="rgba(255,244,190,.85)" filter="url(#hg-glow)" />
                    <Pillar /><Pillar mirror />
                    <path d="M106,560 V260 A194,194 0 0 1 494,260 V560 H450 V260 A150,150 0 0 0 150,260 V560 Z" fill="url(#hg-stone-v)" />
                    <path d="M128,260 A172,172 0 0 1 472,260" fill="none" stroke="#e9c85a" strokeWidth="1" opacity="0.4" />
                    <line x1="128" y1="260" x2="128" y2="560" stroke="#e9c85a" strokeWidth="1" opacity="0.35" />
                    <line x1="472" y1="260" x2="472" y2="560" stroke="#e9c85a" strokeWidth="1" opacity="0.35" />
                    <path d="M150,560 V260 A150,150 0 0 1 450,260 V560" fill="none" stroke="url(#hg-gold)" strokeWidth="3" filter="url(#hg-glow)" />
                    <polygon points="300,22 309,58 344,66 309,74 300,112 291,74 256,66 291,58" fill="url(#hg-star)" filter="url(#hg-glow)" />
                  </svg>

                  <p ref={hintRef} className={`${display.className} hg-hint absolute inset-x-0 bottom-[3%] z-[30] text-center text-md italic text-[#6b5a1f]`}>
                    Touch the seal to open the gate
                  </p>
                </div>

                <CloudBank clouds={FRONT_BANK} bankRef={frontBankRef} origin="50% 100%" z={25} />

                <div ref={mistRef} className="pointer-events-none absolute inset-0 z-40 opacity-0"
                  style={{ background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #f8f5ec 55%, #f5f2e8 100%)" }} />
              </div>
            )}

      {/* MAIN CONTENT */}
      <main ref={mainRef} className="relative flex min-h-[100svh] flex-col">
        <div className="pointer-events-none fixed inset-0 z-0"
          style={{ background: "radial-gradient(circle at 50% 12%, rgba(233,200,90,0.28) 0%, rgba(245,242,232,0) 60%)" }} />

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[34vh] overflow-hidden" aria-hidden="true">
          <motion.div className="absolute inset-0" style={{ y: cloudsParallax }}>
            <motion.div className="absolute inset-0" animate={{ x: [0, -24, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}>
              {PAGE_CLOUDS.map(([x, y, s], i) => <Cloud key={i} x={x} y={y} s={s} />)}
            </motion.div>
          </motion.div>
        </div>

        {/* Header */}
        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className={`${display.className} flex items-center gap-2 text-lg italic text-[#8c6a12]`}>
            <Crown className="h-4 w-4" aria-hidden="true" />
            <span>Official Invitation</span>
          </div>
          <button type="button" onClick={toggleMute}
            className="rounded-full border border-[#c9a227]/50 bg-white/60 p-2.5 text-[#8c6a12] backdrop-blur-md transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fd114]"
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </header>

        {/* Hero Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate={isOpened ? "visible" : "hidden"}
          ref={heroRef as React.RefObject<HTMLDivElement>}
          className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-10 text-center"
        >
          <p className={`reveal-milestone ${display.className} mb-2 text-2xl font-semibold uppercase tracking-widest text-[#8c6a12] opacity-0 sm:text-3xl`}>
            VALINOR '26
          </p>
          <p className="reveal-milestone mb-6 text-sm uppercase tracking-[0.3em] text-[#6b6450] opacity-0">
            A Night Where Legends Say Goodbye !
          </p>

          {/* Poem */}
          <div className="relative mb-10 mt-2 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(201,162,39,0.15)] backdrop-blur-xl sm:p-10">
            <p className={`reveal-poem-title ${display.className} mb-6 text-xl font-semibold italic text-[#8c6a12] opacity-0 sm:text-2xl`}>
              To Our Guiding Stars
            </p>
            {POEM_STANZAS.map((stanza, si) => (
              <div key={si} className={si > 0 ? "mt-5" : ""}>
                {stanza.map((line, li) => (
                  <p key={li} className={`poem-line ${display.className} whitespace-pre-wrap text-lg italic leading-relaxed text-[#4a453a] sm:text-xl`}>
                    {Array.from(line).map((ch, ci) => (
                      <span key={ci} className="poem-char" style={{ opacity: 0 }}>
                        {ch}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            ))}
          </div>

          {/* View Invitation Button */}
          <motion.button
            onClick={() => setShowDetails(true)}
            className={`reveal-btn ${display.className} group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border border-[#c9a227] bg-[#fdfbf3] px-10 py-4 text-xl font-semibold text-[#8c6a12] shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(201,162,39,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fd114] opacity-0`}
          >
            <Sparkles className="h-5 w-5 text-[#c9a227] transition-transform group-hover:rotate-12" />
            Click Here To View Invitation
          </motion.button>
        </motion.section>

        {/* DETAILS SECTION */}
        <AnimatePresence>
          {showDetails && (
            <motion.section
              id="invitation-details"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.2 }}
              className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10 text-center"
            >
              <div className="relative w-full overflow-hidden rounded-[3rem] p-1 bg-gradient-to-br from-[#e9c85a] via-[#f5f2e8] to-[#c9a227] shadow-[0_20px_50px_rgba(201,162,39,0.25)]">
                <div className="rounded-[2.8rem] bg-[#fdfbf3]/95 px-6 py-12 backdrop-blur-xl sm:px-12 sm:py-16 flex flex-col items-center w-full">

                  {/* Text Block */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-10 flex max-w-2xl flex-col gap-4 text-center"
                  >
                    <p className={`${display.className} text-2xl text-[#8c6a12] sm:text-3xl`}>Batch 2022 proudly presents</p>
                    <p className="text-lg font-light leading-relaxed text-[#5e5846]">
                      In honour of our beloved Seniors<br/><span className="font-semibold text-[#c9a227]">Batch 2021</span>
                    </p>
                    <p className="text-base font-light leading-relaxed text-[#5e5846] sm:text-lg">
                      Join us for an evening of memories, music, laughter and farewell, as we step into the Blessed Empire one last time together.
                    </p>
                    <p className={`${display.className} text-xl italic text-[#8c6a12]`}>
                      One Night. A Thousand Memories. One Valinor.
                    </p>
                    <p className="text-base font-light leading-relaxed text-[#5e5846] sm:text-lg">
                      Your presence will make this farewell truly unforgettable.<br/>
                      We can't wait to celebrate you, our Seniors.
                    </p>
                    <p className={`${display.className} mt-2 text-xl italic text-[#8c6a12]`}>
                      With love,<br/>Batch 2022<br/><br/>Faculty of Management Studies<br/><br/>Rajarata University of Sri Lanka<br/>
                    </p>
                  </motion.div>

                  {/* Countdown + Sand Timer */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-14 flex w-full flex-wrap items-center justify-center gap-6"
                  >
                    <SandTimer />
                    <CountdownDisplay />
                  </motion.div>

                  {/* Advanced Cards Layout */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
                    className="mb-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
                  >
                    {/* Date Card - Yellow */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e6bc3e] to-[#f8e189] p-6 shadow-xl text-left">
                      <Calendar className="absolute -right-4 -bottom-4 h-32 w-32 text-black/5" />
                      <div className="mb-6 inline-flex rounded-full bg-[#2a2418] p-2 text-[#f8e189]">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-serif italic text-[#5e4508]">Date</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#2a2418]">21st November</p>
                      <p className="font-serif text-sm font-semibold text-[#2a2418]">2026</p>
                    </div>

                    {/* Time Card - Dark Brown */}
                    <div className="relative overflow-hidden rounded-3xl bg-[#2f270b] p-6 shadow-xl text-left">
                      <Clock className="absolute -right-4 -bottom-4 h-32 w-32 text-white/5" />
                      <div className="mb-6 inline-flex rounded-full bg-[#f8e189]/20 p-2 text-[#f8e189]">
                        <Clock className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-serif italic text-[#e9c85a]">Time</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#f8e189]">6:30 PM</p>
                      <p className="font-serif text-sm font-semibold text-[#f8e189]">onwards</p>
                    </div>

                    {/* Venue Card - Light Cream */}
                    <div className="relative overflow-hidden rounded-3xl border border-[#c9a227] bg-[#fdfbf3] p-6 shadow-xl text-left">
                      <MapPin className="absolute -right-4 -bottom-4 h-32 w-32 text-[#c9a227]/5" />
                      <div className="mb-6 inline-flex rounded-full border border-[#c9a227] bg-white p-2 text-[#c9a227]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-serif italic text-[#c9a227]">Venue</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-[#2a2418]">AVARAGIRA</p>
                    </div>

                    {/* Dress Code Card - Light Gold */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#d4af37] to-[#e6c86e] p-6 shadow-xl text-left">
                      <Shirt className="absolute -right-4 -bottom-4 h-32 w-32 text-white/10" />
                      <div className="mb-6 inline-flex rounded-full bg-white/30 p-2 text-white">
                        <Shirt className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-serif italic text-white/90">Dress Code</p>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2 rounded-full bg-[#fdfbf3] px-3 py-1.5 text-xs font-semibold text-[#2a2418]">
                          <span className="h-3 w-3 rounded-full bg-white border border-[#ccc]"></span> Girls: White
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[#2a2418] px-3 py-1.5 text-xs font-semibold text-white">
                          <span className="h-3 w-3 rounded-full bg-black border border-[#555]"></span> Boys: Black
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex w-full flex-wrap items-center justify-center gap-6"
                  >
                    <button
                      type="button"
                      onClick={downloadTicket}
                      className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-[#c9a227] bg-white/70 px-8 py-4 text-sm font-medium uppercase tracking-wider text-[#8c6a12] backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:shadow-[0_8px_30px_rgba(201,162,39,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fd114]"
                    >
                      <Ticket className="h-5 w-5" aria-hidden="true" />
                      Download Ticket
                    </button>

                    <button
                      type="button"
                      className="cursor-pointer rounded-full bg-gradient-to-r from-[#e9c85a] via-[#d9b640] to-[#c9a227] px-10 py-4 text-sm font-medium uppercase tracking-wider text-[#2b2205] shadow-[0_8px_30px_rgba(201,162,39,0.45)] transition-all hover:scale-105 hover:shadow-[0_8px_40px_rgba(201,162,39,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7fd114]"
                    >
                      We Hope Your Presence
                    </button>
                  </motion.div>

                  {/* Uni Image Added Below Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-14 w-full max-w-2xl px-4"
                  >
                    <img
                      src="/uni.png"
                      alt="Rajarata University"
                      className="mx-auto h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(201,162,39,0.25)]"
                    />
                  </motion.div>

                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="h-[18vh]" aria-hidden="true" />

        {/* FOOTER (Enhanced & Optimized) */}
        <motion.footer
          ref={footerRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.2 } }
          }}
          className="relative z-10 mt-8 border-t border-[#c9a227]/40 bg-gradient-to-b from-transparent via-white/40 to-[#fdfbf3]/80 backdrop-blur-md shadow-[0_-10px_40px_rgba(201,162,39,0.1)]"
        >
          <div className="mx-auto max-w-4xl px-6 py-16">
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }} className="mb-8 flex justify-center">
              <svg width="80" height="24" viewBox="0 0 80 24" aria-hidden="true">
                <line x1="0" y1="12" x2="32" y2="12" stroke="#c9a227" strokeWidth="1.5" opacity="0.6" />
                <polygon points="40,4 46,12 40,20 34,12" fill="#8fdc1c" stroke="#c9a227" strokeWidth="1.5" />
                <line x1="48" y1="12" x2="80" y2="12" stroke="#c9a227" strokeWidth="1.5" opacity="0.6" />
              </svg>
            </motion.div>

            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={`${display.className} text-center text-3xl italic text-[#8c6a12] sm:text-4xl drop-shadow-sm`}>
              A Brotherhood Forever
            </motion.p>
            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="mt-3 text-center text-sm uppercase tracking-widest text-[#6b6450]">
              With love and gratitude from Batch 2022
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mt-12 grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
              {[
                { label: "Date", value: "21st Nov 2026" },
                { label: "Time", value: "6:30 PM" },
                { label: "Venue", value: "AVARAGIRA" },
                { label: "Dress", value: "White / Black" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/40 p-4 border border-[#c9a227]/20 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-[#8c6a12]/80 font-semibold">
                    {item.label}
                  </p>
                  <p className={`${display.className} mt-1 text-lg font-semibold text-[#2a2418]`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="my-12 flex items-center justify-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
              <span className="text-sm text-[#c9a227]">✦</span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c9a227]/50 to-transparent" />
            </motion.div>

            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-center text-[12px] font-semibold uppercase tracking-[0.3em] text-[#8c6a12]">
              VALINOR '26
            </motion.p>
            <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="mt-2 text-center text-[10px] uppercase tracking-widest text-[#a09579]">
              Faculty of Management{year ? ` · ${year}` : ""}
            </motion.p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
