"use client";

import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Dna,
  Zap,
  Copy,
  Check,
  Download,
  RefreshCw,
  FlaskConical,
  Activity,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { Interactive3DDNA } from "./Interactive3DDNA";

type ModelName = "svm" | "xgboost";

type Prediction = {
  id?: number;
  model: ModelName;
  label: "promoter" | "non_promoter";
  confidence: number;
  promoter_probability: number;
  sequence: { length: number; gc_content: number };
  created_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend-972d617d.fastapicloud.dev";

const PRESET_SEQUENCES = [
  {
    name: "Vinca Rosea Biosynthetic Promoter",
    description: "Contains classic -35 (TTGACA) and -10 (TATAAT) consensus hexamers",
    sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC",
  },
  {
    name: "Non-Promoter Coding Region",
    description: "High-GC coding exon sequence without promoter motifs",
    sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA",
  },
  {
    name: "Mutated Promoter Box Variant",
    description: "Point mutation in -10 hexamer box",
    sequence: "TTGACATGCATCGATCGATCGATCGATCGACCCAAATGCATCGATCGATCGATCGATC",
  },
  {
    name: "High-AT Upstream Region",
    description: "Rich AT spacer sequence enabling rapid DNA melting",
    sequence: "TTGACATTTTTATATATATATATATATATATATAATGCATCGATCGATCGATCGATC",
  },
];

function validateSequence(sequence: string) {
  const normalized = sequence.replace(/\s/g, "").toUpperCase();
  if (!normalized) return "Enter a DNA sequence to analyze.";
  if (normalized.length < 4) return "A sequence must contain at least 4 bases.";
  if (!/^[ACGT]+$/.test(normalized)) return "Sequence must contain only A, C, G, and T bases.";
  return null;
}

function calculateBaseStats(seq: string) {
  const normalized = seq.replace(/\s/g, "").toUpperCase();
  if (!normalized) return null;
  const len = normalized.length;
  const counts = { A: 0, C: 0, G: 0, T: 0 };
  for (const char of normalized) {
    if (char in counts) counts[char as keyof typeof counts]++;
  }
  const gc = Math.round(((counts.G + counts.C) / len) * 100);
  const at = Math.round(((counts.A + counts.T) / len) * 100);

  const has35 = normalized.includes("TTGACA");
  const has10 = normalized.includes("TATAAT") || normalized.includes("TATAA");

  return { counts, gc, at, total: len, has35, has10 };
}

function getComplementStrand(seq: string) {
  const normalized = seq.replace(/\s/g, "").toUpperCase();
  const map: Record<string, string> = { A: "T", T: "A", C: "G", G: "C" };
  return normalized
    .split("")
    .map((b) => map[b] || b)
    .join("");
}

export function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"analyze" | "explainer" | "history">("analyze");
  const [sequence, setSequence] = useState(PRESET_SEQUENCES[0].sequence);
  const [model, setModel] = useState<ModelName>("svm");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);

  const validationError = useMemo(() => validateSequence(sequence), [sequence]);
  const baseStats = useMemo(() => calculateBaseStats(sequence), [sequence]);
  const complementStrand = useMemo(() => getComplementStrand(sequence), [sequence]);

  const historyStats = useMemo(() => {
    if (!history.length) return null;
    const total = history.length;
    const promoters = history.filter((h) => h.label === "promoter").length;
    const promoterRatio = Math.round((promoters / total) * 100);
    const avgConfidence = Math.round(
      (history.reduce((acc, curr) => acc + curr.confidence, 0) / total) * 100
    );
    return { total, promoters, promoterRatio, avgConfidence };
  }, [history]);

  async function buildApiHeaders(isJson = false): Promise<Record<string, string>> {
    const token = await getToken();
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const headers: Record<string, string> = {
      "x-user-id": user?.id || "demo-user",
    };
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }
    return headers;
  }

  async function fetchHistory() {
    setIsHistoryLoading(true);
    try {
      const headers = await buildApiHeaders();
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/predictions?limit=50`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch {
      // Ignore background fetch errors silently
    } finally {
      setIsHistoryLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [user?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setPrediction(null);
    setIsLoading(true);

    try {
      const headers = await buildApiHeaders(true);
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/predictions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sequence, model }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Prediction analysis failed.");

      const newPred = payload as Prediction;
      setPrediction(newPred);
      fetchHistory();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The prediction analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopySequence() {
    navigator.clipboard.writeText(sequence);
    setCopyNotification(true);
    setTimeout(() => setCopyNotification(false), 2000);
  }

  function handleDownloadJSON() {
    if (!prediction) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prediction, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vinca_genomic_prediction_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background ambient lighting & grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090d16]">
                <Dna className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white hover:opacity-90">
              Vinca <span className="text-indigo-400">Genomics</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1 text-xs font-semibold text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Research Engine
            </div>
            <span className="hidden text-xs font-medium text-slate-400 sm:block">
              {user?.firstName ? `Hi, ${user.firstName}` : user?.emailAddresses?.[0]?.emailAddress || "Research Workspace"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        {/* Title & Navigation Tabs */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-bold text-indigo-300">
              <FlaskConical className="h-3.5 w-3.5 text-indigo-400" /> GENOMIC PROMOTER INTELLIGENCE WORKSPACE
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Sequence Classifier</h1>
          </div>

          <div className="flex overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-1.5 backdrop-blur">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "analyze"
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Dna className="h-4 w-4" /> Sequence Classifier
            </button>
            <button
              onClick={() => setActiveTab("explainer")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "explainer"
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" /> 3D Gene Visualizer
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                fetchHistory();
              }}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="h-4 w-4" /> Prediction History
              {history.length > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${activeTab === "history" ? "bg-slate-950 text-indigo-300" : "bg-slate-800 text-slate-300"}`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: Sequence Classifier */}
        {activeTab === "analyze" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            {/* Input Form Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Sequence Presets</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRESET_SEQUENCES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSequence(preset.sequence);
                          setError(null);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/40 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-200"
                        title={preset.description}
                      >
                        <Zap className="h-3.5 w-3.5 text-indigo-400" /> {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="sequence" className="text-sm font-bold text-white">
                    DNA Sequence (5&apos; &rarr; 3&apos;)
                  </label>
                  {baseStats && (
                    <span className="text-xs font-mono font-bold text-indigo-400">{baseStats.total} Base Pairs</span>
                  )}
                </div>

                <div className="relative mt-2">
                  <textarea
                    id="sequence"
                    value={sequence}
                    onChange={(e) => {
                      setSequence(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Paste DNA sequence (A, C, G, T)..."
                    spellCheck={false}
                    className="min-h-48 w-full resize-y rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm tracking-widest text-indigo-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                  <div className="absolute right-3 top-3 flex gap-2">
                    {sequence && (
                      <>
                        <button
                          type="button"
                          onClick={handleCopySequence}
                          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          {copyNotification ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          {copyNotification ? "Copied" : "Copy"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSequence("")}
                          className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {baseStats && baseStats.total > 0 && (
                  <div className="mt-4 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                      <span className="font-bold">Nucleotide Base Composition</span>
                      <div className="flex gap-3 font-mono">
                        <span className="text-indigo-300">GC: {baseStats.gc}%</span>
                        <span className="text-amber-300">AT: {baseStats.at}%</span>
                      </div>
                    </div>

                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-900">
                      <div style={{ width: `${(baseStats.counts.A / baseStats.total) * 100}%` }} className="bg-emerald-500" title={`Adenine: ${baseStats.counts.A}`} />
                      <div style={{ width: `${(baseStats.counts.C / baseStats.total) * 100}%` }} className="bg-indigo-500" title={`Cytosine: ${baseStats.counts.C}`} />
                      <div style={{ width: `${(baseStats.counts.G / baseStats.total) * 100}%` }} className="bg-violet-500" title={`Guanine: ${baseStats.counts.G}`} />
                      <div style={{ width: `${(baseStats.counts.T / baseStats.total) * 100}%` }} className="bg-purple-500" title={`Thymine: ${baseStats.counts.T}`} />
                    </div>

                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-emerald-400">A: {baseStats.counts.A}</span>
                      <span className="text-indigo-400">C: {baseStats.counts.C}</span>
                      <span className="text-violet-400">G: {baseStats.counts.G}</span>
                      <span className="text-purple-400">T: {baseStats.counts.T}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 font-bold">Consensus Motifs:</span>
                      {baseStats.has35 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" /> -35 Box (TTGACA)
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[11px] text-slate-500">
                          No exact -35 box
                        </span>
                      )}

                      {baseStats.has10 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300">
                          <CheckCircle2 className="h-3 w-3" /> -10 Box (TATAAT)
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-900 border border-slate-800 px-2.5 py-0.5 text-[11px] text-slate-500">
                          No exact -10 box
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <fieldset className="mt-6">
                  <legend className="text-sm font-bold text-white">Classifier Model Architecture</legend>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                        model === "svm"
                          ? "border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="svm"
                        checked={model === "svm"}
                        onChange={() => setModel("svm")}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">SVM Classifier</span>
                        {model === "svm" && <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />}
                      </div>
                      <span className="mt-1 text-xs text-slate-400">Radial Basis Function (RBF) Kernel</span>
                    </label>

                    <label
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                        model === "xgboost"
                          ? "border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="model"
                        value="xgboost"
                        checked={model === "xgboost"}
                        onChange={() => setModel("xgboost")}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">XGBoost Classifier</span>
                        {model === "xgboost" && <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />}
                      </div>
                      <span className="mt-1 text-xs text-slate-400">Gradient-Boosted Decision Trees</span>
                    </label>
                  </div>
                </fieldset>

                {error && (
                  <div role="alert" className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-200">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Analyzing Sequence Motifs...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 text-indigo-200" /> Run Promoter Prediction
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Results Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <section aria-live="polite" className="h-full rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Prediction Results</h2>
                    {prediction && (
                      <button
                        onClick={handleDownloadJSON}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                      >
                        <Download className="h-3.5 w-3.5" /> Download JSON
                      </button>
                    )}
                  </div>

                  {!prediction && !isLoading && (
                    <div className="mt-8 flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
                        <Dna className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="mt-4 font-bold text-slate-300">Ready for Sequence Input</p>
                      <p className="mt-1 max-w-xs text-xs text-slate-500">
                        Select a preset or enter a DNA sequence on the left and click &ldquo;Run Promoter Prediction&rdquo;.
                      </p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="mt-8 flex min-h-[380px] animate-pulse flex-col items-center justify-center rounded-2xl bg-slate-800/20 p-8 text-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
                      <p className="mt-5 text-sm font-bold text-white">Extracting Genomic Features...</p>
                      <p className="mt-1 text-xs text-slate-400">Evaluating predictive probability score</p>
                    </div>
                  )}

                  {prediction && (
                    <div className="mt-6 space-y-6">
                      <div
                        className={`relative overflow-hidden rounded-2xl border p-6 ${
                          prediction.label === "promoter"
                            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 text-emerald-100 shadow-xl shadow-emerald-950/20"
                            : "border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 text-amber-100 shadow-xl shadow-amber-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                            {prediction.label === "promoter" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-amber-400" />}
                            {prediction.label === "promoter" ? "Promoter Region Detected" : "Non-Promoter Region"}
                          </span>
                          <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-80">
                            {prediction.model.toUpperCase()} Engine
                          </span>
                        </div>

                        <div className="mt-5 flex items-baseline justify-between">
                          <div>
                            <p className="text-4xl font-black">
                              {Math.round(prediction.promoter_probability * 100)}%
                            </p>
                            <p className="text-xs opacity-75 mt-0.5">Promoter Probability</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{Math.round(prediction.confidence * 100)}%</p>
                            <p className="text-xs opacity-75">Confidence Score</p>
                          </div>
                        </div>

                        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-950/80 p-0.5">
                          <div
                            style={{ width: `${Math.round(prediction.promoter_probability * 100)}%` }}
                            className={`h-full rounded-full transition-all duration-700 ${
                              prediction.label === "promoter" ? "bg-gradient-to-r from-emerald-400 to-teal-300" : "bg-gradient-to-r from-amber-400 to-orange-400"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Sequence Length" value={`${prediction.sequence.length} bp`} />
                        <MetricCard label="GC Content Ratio" value={`${Math.round(prediction.sequence.gc_content * 100)}%`} />
                        <MetricCard label="Model Selected" value={prediction.model === "svm" ? "SVM (RBF)" : "XGBoost Trees"} />
                        <MetricCard label="Classification" value={prediction.label === "promoter" ? "Positive (+)" : "Negative (-)"} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-slate-800/60 pt-4 text-center text-xs text-slate-500">
                  Protected Research Workspace Session
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive 3D Gene Visualizer */}
        {activeTab === "explainer" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 h-[460px] sm:h-[500px]">
              <Interactive3DDNA activeSequence={sequence} />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Real-Time Complementary Strand</span>
                <h3 className="mt-2 text-xl font-bold text-white">Double-Stranded Base Pairing</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  DNA forms a double helix where Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds, and Cytosine (C) pairs with Guanine (G) via 3 hydrogen bonds.
                </p>

                <div className="mt-6 font-mono text-xs overflow-x-auto space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold">
                    <span className="w-20 text-slate-500 text-[10px]">5&apos;&rarr;3&apos; Strand:</span>
                    <span className="tracking-widest">{sequence || "TTGACATGCATCGATCGATCGATCGATC"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-violet-300 font-bold">
                    <span className="w-20 text-slate-500 text-[10px]">3&apos;&rarr;5&apos; Strand:</span>
                    <span className="tracking-widest">{complementStrand || "AACTGTACGTAGCTAGCTAGCTAGCTAG"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                💡 Drag mouse on the 3D Canvas on the left to rotate the WebGL double helix model.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Prediction History */}
        {activeTab === "history" && (
          <div className="mt-8 space-y-6">
            {historyStats && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Runs</p>
                  <p className="mt-2 text-3xl font-black text-white">{historyStats.total}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Promoters Detected</p>
                  <p className="mt-2 text-3xl font-black text-emerald-400">{historyStats.promoters}</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Promoter Ratio</p>
                  <p className="mt-2 text-3xl font-black text-indigo-400">{historyStats.promoterRatio}%</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Avg Confidence</p>
                  <p className="mt-2 text-3xl font-black text-violet-400">{historyStats.avgConfidence}%</p>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Saved Prediction History</h2>
                  <p className="mt-1 text-xs text-slate-400">Sequence classifications logged for your research session.</p>
                </div>
                <button
                  onClick={fetchHistory}
                  disabled={isHistoryLoading}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isHistoryLoading ? "animate-spin" : ""}`} />
                  {isHistoryLoading ? "Refreshing..." : "Refresh History"}
                </button>
              </div>

              {history.length === 0 && !isHistoryLoading && (
                <div className="mt-8 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
                  <p className="font-bold text-slate-300">No predictions recorded yet</p>
                  <p className="mt-1 text-xs text-slate-500">Run a sequence analysis on the Classifier tab to log results.</p>
                </div>
              )}

              {history.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pl-2">ID</th>
                        <th className="pb-3">Result</th>
                        <th className="pb-3">Probability</th>
                        <th className="pb-3">Model</th>
                        <th className="pb-3">Length</th>
                        <th className="pb-3">GC %</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      {history.map((item) => (
                        <tr key={item.id} className="transition hover:bg-slate-800/30">
                          <td className="py-3.5 pl-2 text-slate-500">#{item.id}</td>
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                item.label === "promoter"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {item.label === "promoter" ? "Promoter" : "Non-promoter"}
                            </span>
                          </td>
                          <td className="py-3.5 font-bold text-white">
                            {Math.round(item.promoter_probability * 100)}%
                          </td>
                          <td className="py-3.5 uppercase text-indigo-400">{item.model}</td>
                          <td className="py-3.5 text-slate-300">{item.sequence.length} bp</td>
                          <td className="py-3.5 text-slate-300">{Math.round(item.sequence.gc_content * 100)}%</td>
                          <td className="py-3.5 text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleString() : "Recently"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
