"use client";

import Link from "next/link";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useMemo, useState } from "react";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const PRESET_SEQUENCES = [
  {
    name: "E. coli σ70 Promoter",
    description: "-35 (TTGACA) and -10 (TATAAT) consensus regions",
    sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC",
  },
  {
    name: "Non-Promoter Coding Region",
    description: "High-GC coding exon sequence",
    sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA",
  },
  {
    name: "Mutated Promoter Variant",
    description: "Point mutation in -10 hexamer box",
    sequence: "TTGACATGCATCGATCGATCGATCGATCGACCCAAATGCATCGATCGATCGATCGATC",
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
  const gc = ((counts.G + counts.C) / len) * 100;
  const at = ((counts.A + counts.T) / len) * 100;
  return { counts, gc: Math.round(gc), at: Math.round(at), total: len };
}

export function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"analyze" | "history">("analyze");
  const [sequence, setSequence] = useState(PRESET_SEQUENCES[0].sequence);
  const [model, setModel] = useState<ModelName>("svm");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validationError = useMemo(() => validateSequence(sequence), [sequence]);
  const baseStats = useMemo(() => calculateBaseStats(sequence), [sequence]);

  async function fetchHistory() {
    setIsHistoryLoading(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "X-User-Id": user?.id || "demo-user",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/predictions?limit=50`, {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch {
      // Ignore silent background history fetch errors
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
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-User-Id": user?.id || "demo-user",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/predictions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sequence, model }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Prediction request failed.");
      
      const newPred = payload as Prediction;
      setPrediction(newPred);
      fetchHistory(); // refresh history list
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The prediction request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background radial glow effect */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <span className="font-mono text-lg font-black text-slate-950">P</span>
            </div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-90">
              PromoterLab <span className="ml-1 text-xs font-semibold text-cyan-400">AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              FastAPI Connected
            </div>
            <span className="hidden text-sm text-slate-400 sm:block">
              {user?.firstName ? `Hi, ${user.firstName}` : user?.emailAddresses?.[0]?.emailAddress || "Workspace"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        {/* Title & Navigation Tabs */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">E. coli Promoter Intelligence</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Sequence Classifier</h1>
          </div>

          <div className="flex rounded-xl border border-slate-800 bg-slate-900/80 p-1 backdrop-blur">
            <button
              onClick={() => setActiveTab("analyze")}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                activeTab === "analyze"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Analyze Sequence
            </button>
            <button
              onClick={() => {
                setActiveTab("history");
                fetchHistory();
              }}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              History
              {history.length > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === "history" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Analysis Workspace */}
        {activeTab === "analyze" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Input Form Column */}
            <div className="flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                {/* Presets Row */}
                <div className="mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Presets</span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {PRESET_SEQUENCES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSequence(preset.sequence);
                          setError(null);
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-800/40 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                        title={preset.description}
                      >
                        ⚡ {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sequence Textarea */}
                <div className="flex items-center justify-between">
                  <label htmlFor="sequence" className="text-sm font-semibold text-white">
                    DNA Sequence (5&apos; &rarr; 3&apos;)
                  </label>
                  {baseStats && (
                    <span className="text-xs font-mono text-cyan-400">{baseStats.total} bases</span>
                  )}
                </div>
                
                <div className="relative mt-2">
                  <textarea
                    id="sequence"
                    value={sequence}
                    onChange={(e) => {
                      setSequence(e.target.value);
                      setError(null);
                    }}
                    placeholder="Paste DNA sequence (A, C, G, T)..."
                    spellCheck={false}
                    className="min-h-44 w-full resize-y rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-sm tracking-widest text-cyan-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  />
                  {sequence && (
                    <button
                      type="button"
                      onClick={() => setSequence("")}
                      className="absolute right-3 top-3 rounded-lg border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Base Distribution Bar */}
                {baseStats && baseStats.total > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Base Composition</span>
                      <span className="font-mono text-cyan-300">GC Ratio: {baseStats.gc}%</span>
                    </div>
                    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div style={{ width: `${(baseStats.counts.A / baseStats.total) * 100}%` }} className="bg-emerald-500" title={`A: ${baseStats.counts.A}`} />
                      <div style={{ width: `${(baseStats.counts.C / baseStats.total) * 100}%` }} className="bg-cyan-500" title={`C: ${baseStats.counts.C}`} />
                      <div style={{ width: `${(baseStats.counts.G / baseStats.total) * 100}%` }} className="bg-indigo-500" title={`G: ${baseStats.counts.G}`} />
                      <div style={{ width: `${(baseStats.counts.T / baseStats.total) * 100}%` }} className="bg-purple-500" title={`T: ${baseStats.counts.T}`} />
                    </div>
                    <div className="mt-2.5 flex justify-between font-mono text-[11px]">
                      <span className="text-emerald-400">A: {baseStats.counts.A}</span>
                      <span className="text-cyan-400">C: {baseStats.counts.C}</span>
                      <span className="text-indigo-400">G: {baseStats.counts.G}</span>
                      <span className="text-purple-400">T: {baseStats.counts.T}</span>
                    </div>
                  </div>
                )}

                {/* Model Selection */}
                <fieldset className="mt-6">
                  <legend className="text-sm font-semibold text-white">Classifier Model</legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                        model === "svm"
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
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
                        {model === "svm" && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                      </div>
                      <span className="mt-1 text-xs text-slate-400">Radial Basis Function (RBF) Kernel</span>
                    </label>

                    <label
                      className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition ${
                        model === "xgboost"
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
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
                        {model === "xgboost" && <span className="h-2 w-2 rounded-full bg-cyan-400" />}
                      </div>
                      <span className="mt-1 text-xs text-slate-400">Gradient-Boosted Decision Trees</span>
                    </label>
                  </div>
                </fieldset>

                {error && (
                  <div role="alert" className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  disabled={isLoading}
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-3.5 font-bold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      Analyzing Sequence...
                    </>
                  ) : (
                    "⚡ Run Promoter Prediction"
                  )}
                </button>
              </form>
            </div>

            {/* Results Column */}
            <div className="flex flex-col">
              <section aria-live="polite" className="h-full rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                <h2 className="text-lg font-bold text-white">Prediction Analysis</h2>

                {!prediction && !isLoading && (
                  <div className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/50 text-2xl">
                      🧬
                    </div>
                    <p className="mt-4 font-semibold text-slate-300">Ready for Sequence Input</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      Submit a DNA sequence above to view promoter probability, confidence score, and sequence properties.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-6 flex min-h-[360px] animate-pulse flex-col items-center justify-center rounded-2xl bg-slate-800/20 p-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                    <p className="mt-4 text-sm font-medium text-slate-400">Extracting 347 k-mer &amp; physicochemical features...</p>
                  </div>
                )}

                {prediction && (
                  <div className="mt-6 space-y-6">
                    {/* Status Badge */}
                    <div
                      className={`relative overflow-hidden rounded-2xl border p-6 ${
                        prediction.label === "promoter"
                          ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-950/40 text-emerald-100 shadow-xl shadow-emerald-950/20"
                          : "border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-amber-950/40 text-amber-100 shadow-xl shadow-amber-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                          {prediction.label === "promoter" ? "✓ Promoter Detected" : "✕ Non-Promoter"}
                        </span>
                        <span className="font-mono text-xs font-bold uppercase tracking-wider opacity-80">
                          {prediction.model.toUpperCase()} Model
                        </span>
                      </div>

                      <div className="mt-4 flex items-baseline justify-between">
                        <div>
                          <p className="text-3xl font-extrabold sm:text-4xl">
                            {Math.round(prediction.promoter_probability * 100)}%
                          </p>
                          <p className="text-xs opacity-75">Promoter Probability</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{Math.round(prediction.confidence * 100)}%</p>
                          <p className="text-xs opacity-75">Confidence Score</p>
                        </div>
                      </div>

                      {/* Probability Meter */}
                      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-950/60 p-0.5">
                        <div
                          style={{ width: `${Math.round(prediction.promoter_probability * 100)}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            prediction.label === "promoter" ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard label="Sequence Length" value={`${prediction.sequence.length} bp`} />
                      <MetricCard label="GC Content" value={`${Math.round(prediction.sequence.gc_content * 100)}%`} />
                      <MetricCard label="Model Selected" value={prediction.model === "svm" ? "SVM (RBF)" : "XGBoost"} />
                      <MetricCard label="Classification" value={prediction.label === "promoter" ? "Positive (+)" : "Negative (-)"} />
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* Tab 2: Prediction History */}
        {activeTab === "history" && (
          <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Saved Prediction History</h2>
                <p className="mt-1 text-xs text-slate-400">Sequence classifications saved for your authenticated session.</p>
              </div>
              <button
                onClick={fetchHistory}
                disabled={isHistoryLoading}
                className="rounded-xl border border-slate-800 bg-slate-800/40 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-800 hover:text-cyan-200"
              >
                {isHistoryLoading ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>

            {history.length === 0 && !isHistoryLoading && (
              <div className="mt-8 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
                <p className="font-semibold text-slate-300">No predictions recorded yet</p>
                <p className="mt-1 text-xs text-slate-500">Run a prediction on the Analyze tab to save sequence results.</p>
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
                        <td className="py-3.5 uppercase text-cyan-400">{item.model}</td>
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
        )}
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

