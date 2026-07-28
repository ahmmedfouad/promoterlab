"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import {
  Dna,
  Sparkles,
  Zap,
  ShieldCheck,
  FlaskConical,
  Activity,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
  Layers,
  ExternalLink,
} from "lucide-react";
import { Interactive3DDNA } from "./components/Interactive3DDNA";

const DEMO_PRESETS = [
  {
    name: "Vinca Rosea Biosynthetic Promoter",
    sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC",
    type: "Promoter",
    desc: "Active promoter controlling alkaloid biosynthetic pathway gene",
  },
  {
    name: "Non-Promoter High-GC Exon",
    sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA",
    type: "Non-Promoter",
    desc: "High GC coding sequence with no promoter motif structures",
  },
  {
    name: "High-Yield Mutant Promoter Variant",
    sequence: "TTGACATTTTTATATATATATATATATATATATAATGCATCGATCGATCGATCGATC",
    type: "Promoter",
    desc: "Rich AT spacer region enabling rapid enzymatic unwinding",
  },
];

export default function Home() {
  const [demoSequence, setDemoSequence] = useState(DEMO_PRESETS[0].sequence);
  const [activeExplainerStep, setActiveExplainerStep] = useState<"-35" | "spacer" | "-10" | "tss" | "gene">("-10");

  const baseStats = useMemo(() => {
    const seq = demoSequence.replace(/\s/g, "").toUpperCase();
    if (!seq) return null;
    const len = seq.length;
    const counts = { A: 0, C: 0, G: 0, T: 0 };
    for (const char of seq) {
      if (char in counts) counts[char as keyof typeof counts]++;
    }
    const gc = Math.round(((counts.G + counts.C) / len) * 100);
    const at = Math.round(((counts.A + counts.T) / len) * 100);
    const has35 = seq.includes("TTGACA");
    const has10 = seq.includes("TATAAT") || seq.includes("TATAA");
    return { counts, total: len, gc, at, has35, has10 };
  }, [demoSequence]);

  return (
    <main className="relative min-h-screen bg-[#090d16] text-slate-100 selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden">
      {/* Dynamic Scroll-Linked Ambient Gradient & Backdrop Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[650px] w-[950px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/25 via-indigo-600/20 to-cyan-500/15 blur-[140px]" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090d16]">
                <Dna className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white hover:opacity-90">
              Promoter <span className="text-indigo-400">Lab</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
            <a href="#workbench" className="transition hover:text-indigo-400">Genomic Workbench</a>
            <a href="#explainer" className="transition hover:text-indigo-400">Genomics 101</a>
            <a href="#plans" className="transition hover:text-indigo-400">Access Tiers</a>
          </nav>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800/80 hover:text-white">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110">
                  <Sparkles className="h-4 w-4" /> Get Started
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
                >
                  Research Workspace <ArrowRight className="h-4 w-4" />
                </Link>
                <UserButton />
              </div>
            </Show>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D WebGL Canvas */}
      <section id="visualizer" className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-12 pb-20 lg:px-8 lg:pt-16 lg:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Headline Column */}
          <div className="lg:col-span-6 text-left">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-inner">
              <FlaskConical className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>PROMOTERLAB RESEARCH ENGINE</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              Decode <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">DNA Promoters</span> of Life-Saving Biomolecules.
            </h1>

            <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
              Inspired by <a href="https://en.wikipedia.org/wiki/Vinca" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:underline">Vinca Rosea <ExternalLink className="h-3.5 w-3.5" /></a> research, our platform predicts gene promoter regions with high accuracy to accelerate synthetic biology &amp; pharmaceutical biosynthesis.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:scale-[1.02] hover:brightness-110">
                    <Dna className="h-5 w-5" /> Launch Research Workspace
                  </button>
                </SignUpButton>
                <a
                  href="#workbench"
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 px-7 py-3.5 font-semibold text-slate-200 backdrop-blur transition hover:border-indigo-500/40 hover:bg-slate-800"
                >
                  Try Workbench ↓
                </a>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-indigo-500/25 transition hover:scale-[1.02] hover:brightness-110"
                >
                  <Dna className="h-5 w-5" /> Go to Workspace &rarr;
                </Link>
              </Show>
            </div>

            {/* Quick Metrics */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
              <div>
                <p className="text-2xl font-black text-white">347</p>
                <p className="text-xs text-slate-400">Features Extracted</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">98.4%</p>
                <p className="text-xs text-slate-400">Model Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-black text-cyan-400">&lt; 40ms</p>
                <p className="text-xs text-slate-400">Inference Speed</p>
              </div>
            </div>
          </div>

          {/* 3D WebGL Canvas Visualizer Column */}
          <div className="lg:col-span-6 h-[440px] sm:h-[480px]">
            <Interactive3DDNA activeSequence={demoSequence} />
          </div>
        </div>
      </section>

      {/* Vinca DNA Promoter Workbench Section */}
      <section id="workbench" className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-20 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Interactive Tool</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Vinca DNA Promoter Workbench
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-400">
              Select a research sample DNA sequence below to inspect base pair breakdown, GC stability ratios, and consensus hexamers in real time.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            {/* Input Box */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl lg:col-span-7 sm:p-8">
              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Research Sample Sequences</span>
                  <div className="flex gap-2">
                    {DEMO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setDemoSequence(preset.sequence)}
                        className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
                          demoSequence === preset.sequence
                            ? "border-indigo-400 bg-indigo-500/10 text-indigo-300"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                        }`}
                      >
                        Sample #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mt-3">
                  <textarea
                    value={demoSequence}
                    onChange={(e) => setDemoSequence(e.target.value.toUpperCase())}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm tracking-widest text-indigo-200 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                    placeholder="Enter DNA sequence (A, C, G, T)..."
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Detected Hexamers:</span>
                  {baseStats?.has35 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> -35 Box (TTGACA)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-500">
                      ✕ No exact -35 box
                    </span>
                  )}

                  {baseStats?.has10 ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> -10 Box (TATAAT)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-500">
                      ✕ No exact -10 box
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
                <div className="text-xs text-slate-400">
                  Total Sequence Length: <strong className="font-mono text-white">{baseStats?.total || 0} bp</strong>
                </div>
                <Show when="signed-out">
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-400">
                      Analyze with AI Models <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-400"
                  >
                    Open Full Classifier Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Show>
              </div>
            </div>

            {/* Base Composition Visualizer */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl lg:col-span-5 sm:p-8">
              <div>
                <h3 className="text-lg font-bold text-white">Nucleotide Base Composition</h3>
                <p className="mt-1 text-xs text-slate-400">Distribution of Adenine, Cytosine, Guanine, and Thymine</p>

                {baseStats && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-indigo-400">GC Ratio (Thermodynamic Stability)</span>
                        <span className="font-mono text-indigo-300">{baseStats.gc}%</span>
                      </div>
                      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-950">
                        <div style={{ width: `${baseStats.gc}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-amber-400">AT Ratio (Promoter Unwinding)</span>
                        <span className="font-mono text-amber-300">{baseStats.at}%</span>
                      </div>
                      <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-950">
                        <div style={{ width: `${baseStats.at}%` }} className="h-full bg-gradient-to-r from-amber-500 to-violet-400 transition-all duration-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">Adenine (A)</span>
                          <span className="font-mono text-xs font-bold text-white">{baseStats.counts.A}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-400">Cytosine (C)</span>
                          <span className="font-mono text-xs font-bold text-white">{baseStats.counts.C}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-violet-400">Guanine (G)</span>
                          <span className="font-mono text-xs font-bold text-white">{baseStats.counts.G}</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-400">Thymine (T)</span>
                          <span className="font-mono text-xs font-bold text-white">{baseStats.counts.T}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-xl bg-slate-950/60 p-3 text-center text-xs text-slate-400">
                💡 High AT regions lower thermal melting energy required for RNA Polymerase to open the transcription bubble.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Genomics 101 */}
      <section id="explainer" className="relative z-10 py-24">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Genomics 101</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Understanding DNA &amp; Promoters Simply
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              Genetic code controls how organisms biosynthesize essential compounds. Here is how a promoter works in 3 clear steps:
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur transition-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Dna className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">1. DNA = The Blueprint</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                The double helix strand storing biological instructions written in 4 letters: <strong className="text-emerald-400">A</strong>, <strong className="text-indigo-400">C</strong>, <strong className="text-violet-400">G</strong>, and <strong className="text-purple-400">T</strong>.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur transition-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">2. Gene = Protein Recipe</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                A specific sequence segment encoding instructions for enzymes, proteins, or alkaloid compounds.
              </p>
            </div>

            <div className="rounded-3xl border border-indigo-500/40 bg-indigo-500/10 p-6 backdrop-blur shadow-lg shadow-indigo-500/5 transition-lift">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">3. Promoter = Master ON Switch</h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo-100">
                The regulatory DNA sequence sitting right before a gene that signals cellular machinery: <strong>&ldquo;Plug in here and start copying now!&rdquo;</strong>
              </p>
            </div>
          </div>

          {/* Interactive Strand Diagram */}
          <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl backdrop-blur sm:p-10">
            <h3 className="text-xl font-bold text-white">Anatomy of a Functional Bacterial / Plant Promoter Strand</h3>
            <p className="mt-1 text-xs text-slate-400">Click any consensus box below to inspect its biological function:</p>

            <div className="mt-8 flex flex-col gap-3 overflow-x-auto pb-4">
              <div className="flex min-w-[700px] items-stretch gap-2 font-mono text-xs">
                <div className="flex items-center justify-center rounded-xl bg-slate-950 px-3 font-bold text-slate-500">
                  5&apos;
                </div>

                <button
                  onClick={() => setActiveExplainerStep("-35")}
                  className={`flex-1 rounded-xl border p-4 text-center transition ${
                    activeExplainerStep === "-35"
                      ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-emerald-500/40"
                  }`}
                >
                  <p className="font-bold text-emerald-400">-35 Box Hexamer</p>
                  <p className="mt-1 text-sm font-black text-white">TTGACA</p>
                  <p className="mt-1 text-[10px] text-slate-400">Recognition Target</p>
                </button>

                <button
                  onClick={() => setActiveExplainerStep("spacer")}
                  className={`w-36 rounded-xl border p-4 text-center transition ${
                    activeExplainerStep === "spacer"
                      ? "border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-amber-500/40"
                  }`}
                >
                  <p className="font-bold text-amber-400">Spacer Region</p>
                  <p className="mt-1 text-sm font-black text-white">15-19 bp</p>
                  <p className="mt-1 text-[10px] text-slate-400">Helical Alignment</p>
                </button>

                <button
                  onClick={() => setActiveExplainerStep("-10")}
                  className={`flex-1 rounded-xl border p-4 text-center transition ${
                    activeExplainerStep === "-10"
                      ? "border-indigo-400 bg-indigo-500/20 shadow-lg shadow-indigo-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-indigo-500/40"
                  }`}
                >
                  <p className="font-bold text-indigo-400">-10 TATA Box</p>
                  <p className="mt-1 text-sm font-black text-white">TATAAT</p>
                  <p className="mt-1 text-[10px] text-slate-400">Unwinding Site</p>
                </button>

                <button
                  onClick={() => setActiveExplainerStep("tss")}
                  className={`w-28 rounded-xl border p-4 text-center transition ${
                    activeExplainerStep === "tss"
                      ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-purple-500/40"
                  }`}
                >
                  <p className="font-bold text-purple-400">TSS (+1)</p>
                  <p className="mt-1 text-sm font-black text-white">A / G</p>
                  <p className="mt-1 text-[10px] text-slate-400">Start Base</p>
                </button>

                <button
                  onClick={() => setActiveExplainerStep("gene")}
                  className={`flex-1 rounded-xl border p-4 text-center transition ${
                    activeExplainerStep === "gene"
                      ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-cyan-500/40"
                  }`}
                >
                  <p className="font-bold text-cyan-400">Gene Region</p>
                  <p className="mt-1 text-sm font-black text-white">ATG... TAA</p>
                  <p className="mt-1 text-[10px] text-slate-400">Target Recipe</p>
                </button>

                <div className="flex items-center justify-center rounded-xl bg-slate-950 px-3 font-bold text-slate-500">
                  3&apos;
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
              {activeExplainerStep === "-35" && (
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                    <span>🟢 The -35 Hexamer Box (TTGACA)</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Located roughly 35 base pairs before transcription starts. Acts as an initial docking anchor for RNA Polymerase.
                  </p>
                </div>
              )}

              {activeExplainerStep === "spacer" && (
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                    <span>🟡 The 15-19 Base Pair Spacer</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    The spacing between hexamer boxes ensures both recognition signals face the exact same outer angle on the 3D double helix spiral.
                  </p>
                </div>
              )}

              {activeExplainerStep === "-10" && (
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                    <span>🔵 The -10 TATA Box (TATAAT)</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Located roughly 10 base pairs before transcription starts. Rich in Adenine and Thymine bases, which easily unzip to open the transcription bubble.
                  </p>
                </div>
              )}

              {activeExplainerStep === "tss" && (
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                    <span>🟣 Transcription Start Site (+1)</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    The exact single nucleotide position where the cell begins copying DNA into RNA.
                  </p>
                </div>
              )}

              {activeExplainerStep === "gene" && (
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
                    <span>🔷 Gene Coding Sequence</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    The actual genetic sequence starting with an ATG codon that specifies the amino acid sequence of the target protein.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Access Tiers */}
      <section id="plans" className="relative z-10 border-t border-slate-800/80 bg-slate-950/60 py-24 backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Access Tiers</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Flexible Plans for Researchers &amp; Labs
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Academic Plan */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-lift">
              <div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">Academic / Free</span>
                <p className="mt-4 text-4xl font-extrabold text-white">$0 <span className="text-base font-normal text-slate-400">/ month</span></p>
                <p className="mt-2 text-xs text-slate-400">Ideal for students, educators, and individual sequence checks.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> 3D WebGL Canvas Visualizer</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Standard Prediction Classifier</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Up to 50 saved runs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Interactive Genomics 101</li>
                </ul>
              </div>
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="mt-8 w-full rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-700">
                    Start Free Account
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="mt-8 block text-center rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-700"
                >
                  Open Workspace
                </Link>
              </Show>
            </div>

            {/* Research Lab Plan */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-indigo-500/40 bg-gradient-to-b from-slate-900/80 to-[#090d16] p-8 shadow-2xl backdrop-blur transition-lift">
              <div className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1 text-[10px] font-black uppercase text-white shadow">
                Recommended
              </div>
              <div>
                <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">Research Lab</span>
                <p className="mt-4 text-4xl font-extrabold text-white">$49 <span className="text-base font-normal text-slate-400">/ month</span></p>
                <p className="mt-2 text-xs text-slate-400">Designed for university labs and bio-engineering teams.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Everything in Academic</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Dual SVM &amp; XGBoost AI Classifiers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Unlimited Prediction Logs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Consensus Hexamer Scanner (-35 &amp; -10)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> One-Click JSON Result Export</li>
                </ul>
              </div>
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="mt-8 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:brightness-110">
                    Get Research Access
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="mt-8 block text-center rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:brightness-110"
                >
                  Access Workspace
                </Link>
              </Show>
            </div>

            {/* Institutional Plan */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur transition-lift">
              <div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">Institutional</span>
                <p className="mt-4 text-4xl font-extrabold text-white">Custom</p>
                <p className="mt-2 text-xs text-slate-400">For large synthetic biology &amp; pharmaceutical centers.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> High-Throughput Batch API</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Custom Fine-Tuned Model Weights</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Dedicated Microservice Instances</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Priority Bio-IT Support</li>
                </ul>
              </div>
              <button
                onClick={() => alert("Contact our research team at research@vincagenomics.org")}
                className="mt-8 w-full rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-700"
              >
                Contact Research Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-8">
          <div className="flex items-center gap-3">
            <Dna className="h-5 w-5 text-indigo-400" />
            <span className="font-extrabold text-white">PromoterLab</span>
            <span className="text-xs text-slate-500">© 2026</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
          
            <a href="#workbench" className="hover:text-white">Workbench</a>
            <a href="#explainer" className="hover:text-white">Genomics 101</a>
            <a href="#plans" className="hover:text-white">Access Tiers</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
