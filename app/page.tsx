"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, FlaskConical } from "lucide-react";
import { Interactive3DDNA } from "./components/Interactive3DDNA";
import { SiteHeader } from "./components/SiteHeader";

const SAMPLES = [
  { label: "Promoter", sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC" },
  { label: "High-GC", sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA" },
  { label: "AT-rich", sequence: "TTGACATTTTTATATATATATATATATATATATAATGCATCGATCGATCGATCGATC" },
];

function getStats(sequence: string) {
  const clean = sequence.replace(/\s/g, "").toUpperCase();
  const count = (base: string) => [...clean].filter((char) => char === base).length;
  return {
    length: clean.length,
    gc: Math.round(((count("G") + count("C")) / clean.length) * 100),
    has35: clean.includes("TTGACA"),
    has10: clean.includes("TATAAT") || clean.includes("TATAA"),
  };
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
  return { counts, gc, at, total: len, has35: normalized.includes("TTGACA"), has10: normalized.includes("TATAAT") || normalized.includes("TATAA") };
}

function validateSequence(sequence: string) {
  const normalized = sequence.replace(/\s/g, "").toUpperCase();
  if (!normalized) return "Enter a DNA sequence to analyze.";
  if (normalized.length < 4) return "A sequence must contain at least 4 bases.";
  if (!/^[ACGT]+$/.test(normalized)) return "Sequence must contain only A, C, G, and T bases.";
  return null;
}

type Prediction = {
  id?: number;
  model: "xgboost";
  label: "promoter" | "non_promoter";
  confidence: number;
  promoter_probability: number;
  sequence: { length: number; gc_content: number };
  created_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://backend-972d617d.fastapicloud.dev";

export default function Home() {
  const [sequence, setSequence] = useState(SAMPLES[0].sequence);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyNotification, setCopyNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyze" | "explainer" | "history">("analyze");
  const analyzeSectionRef = useRef<HTMLDivElement>(null);

  const [colors, setColors] = useState({
    bg: "#000000",
    surface: "#FFFFFF",
    text: "#102A43",
    muted: "#486581",
    border: "#C8D9E8",
    accent: "#0F7490",
    "base-a": "#18794E",
    "base-t": "#C2414B",
    "base-c": "#2563B8",
    "base-g": "#718096",
  });

  const stats = useMemo(() => getStats(sequence), [sequence]);
  const baseStats = useMemo(() => calculateBaseStats(sequence), [sequence]);
  const validationError = useMemo(() => validateSequence(sequence), [sequence]);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setPrediction(null);
    setIsLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json", "x-user-id": "local-user" };
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) headers["x-api-key"] = apiKey;
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/v1/predictions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sequence, model: "xgboost" }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Prediction analysis failed.");
      setPrediction(payload as Prediction);
      setHistory((h) => [payload as Prediction, ...h].slice(0, 50));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The prediction analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleCopySequence() {
    navigator.clipboard.writeText(sequence);
    setCopyNotification(true);
    window.setTimeout(() => setCopyNotification(false), 2000);
  }

  function handleDownloadJSON() {
    if (!prediction) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prediction, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prediction_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <main className="minimal-page">
      <SiteHeader />



      {/* Hero */}
      <section className="minimal-section">
        <div className="minimal-hero">
          <div>
            <p className="minimal-kicker">PROMOTERLAB</p>
            <h1>Check a DNA sequence.</h1>
            <p>Submit a fragment and run the classifier to predict whether a promoter region is present.</p>
            <button onClick={() => { setActiveTab("analyze"); analyzeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); analyzeSectionRef.current?.classList.add("minimal-section-highlight"); setTimeout(() => analyzeSectionRef.current?.classList.remove("minimal-section-highlight"), 1200); }} className="minimal-cta" style={{ marginTop: 24, width: "auto" }}>Start Analysis <ArrowRight aria-hidden="true" /></button>
          </div>
          <div>
            <div className="minimal-panel">
              <div className="minimal-panel-header">Live Preview</div>
              <div className="minimal-panel-body">
                <div className="minimal-basebar" style={{ height: 32, borderRadius: 6 }}>
                  {[
                    { w: `${stats.gc}%`, bg: "var(--c-base-a)" },
                    { w: `${100 - stats.gc}%`, bg: "var(--c-base-t)" },
                  ].map((b, i) => <div key={i} style={{ width: b.w, background: b.bg }} />)}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <span className="minimal-stat"><strong>{stats.length}</strong> bp</span>
                  <span className="minimal-stat">GC <strong>{stats.gc}%</strong></span>
                  <span className={`minimal-motif ${stats.has35 ? "found" : "missing"}`}>{stats.has35 ? "TTGACA found" : "No −35 box"}</span>
                  <span className={`minimal-motif ${stats.has10 ? "found" : "missing"}`}>{stats.has10 ? "TATAAT found" : "No −10 box"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="minimal-section minimal-section-alt">
        <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "16px 0" }}>
          <div className="minimal-station"><p className="minimal-station-num">01 / Add</p><h3>Enter a sequence</h3><p>Paste a DNA fragment or choose a preset from the library. Only A, C, G, T bases are accepted.</p></div>
          <div className="station-arrow">→</div>
          <div className="minimal-station"><p className="minimal-station-num">02 / Mark</p><h3>Inspect motifs</h3><p>The tool highlights the −35 and −10 consensus hexamers, if present, as contextual signals.</p></div>
          <div className="station-arrow">→</div>
          <div className="minimal-station"><p className="minimal-station-num">03 / Run</p><h3>Get a prediction</h3><p>submit</p></div>
          <div className="station-arrow">→</div>
          <div className="minimal-station"><p className="minimal-station-num">04 / Review</p><h3>Check history</h3><p>All past runs are saved to this session. Download results as JSON or compare across runs.</p></div>
        </div>
      </section>

{/* Workspace Tabs */}
       <section ref={analyzeSectionRef} id="analyze-section" className="minimal-section">
        <div className="minimal-tabs" role="tablist">
          <button role="tab" aria-selected={activeTab === "analyze"} className={`minimal-tab ${activeTab === "analyze" ? "active" : ""}`} onClick={() => setActiveTab("analyze")}>Analyze</button>
          <button role="tab" aria-selected={activeTab === "explainer"} className={`minimal-tab ${activeTab === "explainer" ? "active" : ""}`} onClick={() => setActiveTab("explainer")}>View DNA</button>
          <button role="tab" aria-selected={activeTab === "history"} className={`minimal-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
            Past results
            {history.length > 0 && (
              <span style={{ marginLeft: 6, padding: "2px 8px", borderRadius: 10, fontSize: "0.65rem", fontWeight: 700, background: activeTab === "history" ? "var(--c-accent)" : "var(--c-border)", color: activeTab === "history" ? "#fff" : "var(--c-text)" }}>
                {history.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "analyze" && (
          <div className="minimal-workspace-grid">
            <div className="flex flex-col gap-5">
              <form onSubmit={handleSubmit} className="minimal-panel">
                <div className="minimal-panel-body">
                  <div className="minimal-presets">
                    {SAMPLES.map((sample) => (
                      <button key={sample.label} type="button" onClick={() => setSequence(sample.sequence)} className={`minimal-preset ${sequence === sample.sequence ? "active" : ""}`}>{sample.label}</button>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <label htmlFor="sequence" style={{ fontSize: "0.8rem", fontWeight: 700 }}>DNA Sequence (5′ → 3′)</label>
                    {baseStats && <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{baseStats.total} bp</span>}
                  </div>

                  <textarea id="sequence" value={sequence} onChange={(e) => setSequence(e.target.value.toUpperCase())} placeholder="Paste DNA sequence (A, C, G, T)..." spellCheck={false} className="minimal-textarea" />

                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {sequence && (
                      <>
                        <button type="button" onClick={handleCopySequence} style={{ fontSize: "0.72rem", fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text, cursor: "pointer" }}>
                          {copyNotification ? "Copied" : "Copy"}
                        </button>
                        <button type="button" onClick={() => setSequence("")} style={{ fontSize: "0.72rem", fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text, cursor: "pointer" }}>Reset</button>
                      </>
                    )}
                  </div>

                  {baseStats && baseStats.total > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 600, fontFamily: "var(--font-mono)", marginBottom: 6 }}>
                        <span>Base Composition</span>
                        <span>GC {baseStats.gc}% · AT {baseStats.at}%</span>
                      </div>
                      <div className="minimal-basebar">
                        <div style={{ width: `${(baseStats.counts.A / baseStats.total) * 100}%`, background: "var(--c-base-a)" }} />
                        <div style={{ width: `${(baseStats.counts.T / baseStats.total) * 100}%`, background: "var(--c-base-t)" }} />
                        <div style={{ width: `${(baseStats.counts.C / baseStats.total) * 100}%`, background: "var(--c-base-c)" }} />
                        <div style={{ width: `${(baseStats.counts.G / baseStats.total) * 100}%`, background: "var(--c-base-g)" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>A <b>{baseStats.counts.A}</b></span>
                        <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>C <b>{baseStats.counts.C}</b></span>
                        <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>G <b>{baseStats.counts.G}</b></span>
                        <span style={{ fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>T <b>{baseStats.counts.T}</b></span>
                      </div>

                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}`, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className={`minimal-motif ${baseStats.has35 ? "found" : "missing"}`}>{baseStats.has35 ? "✓ −35 Box (TTGACA)" : "No exact −35 box"}</span>
                        <span className={`minimal-motif ${baseStats.has10 ? "found" : "missing"}`}>{baseStats.has10 ? "✓ −10 Box (TATAAT)" : "No exact −10 box"}</span>
                      </div>
                    </div>
                  )}

                  {(error || validationError) && (
                    <div role="alert" className="minimal-error" style={{ marginTop: 16 }}>{error || validationError}</div>
                  )}

                  <button disabled={isLoading} type="submit" className="minimal-cta" style={{ marginTop: 20 }}>
                    {isLoading ? (
                      <>
                        <span className="animate-spin" style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <FlaskConical aria-hidden="true" /> Run Prediction
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col">
              <section className="minimal-results" aria-live="polite">
                <div className="minimal-result-header">
                  <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Prediction Result</h2>
                  {prediction && (
                    <button onClick={handleDownloadJSON} style={{ fontSize: "0.72rem", fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text, cursor: "pointer" }}>
                      <Download aria-hidden="true" style={{ width: 12, height: 12, verticalAlign: "middle", marginRight: 4 }} /> JSON
                    </button>
                  )}
                </div>

                {!prediction && !isLoading && (
                  <div className="minimal-empty">
                    <p>Ready for sequence input</p>
                    <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Select a preset or enter a sequence, then run prediction.</p>
                  </div>
                )}

                {isLoading && (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div className="animate-spin" style={{ width: 32, height: 32, border: "3px solid var(--c-border)", borderTopColor: "var(--c-accent)", borderRadius: "50%", margin: "0 auto" }} />
                    <p style={{ marginTop: 16, fontWeight: 600, fontSize: "0.85rem" }}>Analyzing sequence motifs…</p>
                  </div>
                )}

                {prediction && (
                  <div>
                    <div style={{ background: prediction.label === "promoter" ? "var(--c-base-a)" : "var(--c-muted)", color: "#fff", padding: "10px 14px", borderRadius: 8, marginBottom: 20, fontWeight: 700, fontSize: "0.8rem" }}>
                      {prediction.label === "promoter" ? "Promoter Region Detected" : "Non-Promoter Region"}
                    </div>

                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <p className="minimal-result-big">{Math.round(prediction.promoter_probability * 100)}%</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--c-muted)", marginTop: 2 }}>Promoter Probability</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{Math.round(prediction.confidence * 100)}%</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--c-muted)" }}>Confidence</p>
                      </div>
                    </div>

                    <div className="minimal-result-bar"><div style={{ width: `${Math.round(prediction.promoter_probability * 100)}%`, background: prediction.label === "promoter" ? "var(--c-base-a)" : "var(--c-muted)" }} /></div>

                    <div className="minimal-workbench-grid" style={{ marginTop: 20 }}>
                      <div className="minimal-workbench-metric"><p>Sequence</p><p>{prediction.sequence.length} bp</p></div>
                      <div className="minimal-workbench-metric"><p>GC Content</p><p>{Math.round(prediction.sequence.gc_content * 100)}%</p></div>
                      <div className="minimal-workbench-metric"><p>Model</p><p>XGBoost</p></div>
                      <div className="minimal-workbench-metric"><p>Classification</p><p>{prediction.label === "promoter" ? "Positive (+)" : "Negative (−)"}</p></div>
                    </div>

                    <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--c-muted)" }}>
                      A probability score indicates the model&apos;s prediction strength — not a biological certainty.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {activeTab === "explainer" && (
          <div className="minimal-workspace-grid" style={{ marginTop: 24 }}>
            <div style={{ minHeight: 400 }}>
              <Interactive3DDNA activeSequence={sequence} />
            </div>
            <aside>
              <div className="minimal-panel">
                <div className="minimal-panel-body">
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--c-muted)", fontFamily: "var(--font-mono)" }}>Readable Sequence Guide</span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "8px 0 4px" }}>Learn the paired bases.</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--c-muted)", lineHeight: 1.5, margin: 0 }}>
                    The viewer shows the input strand and its complement so you can inspect the sequence before running prediction.
                  </p>
                  <div style={{ marginTop: 16, padding: 16, border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.surface, fontFamily: "var(--font-mono)", fontSize: "0.75rem", lineHeight: 1.8 }}>
                    <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--c-muted)", minWidth: 48 }}>Input</span><span style={{ wordBreak: "break-all" }}>{sequence || "TTGACATGCATCGATCGATCGATCGATC"}</span></div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}><span style={{ color: "var(--c-muted)", minWidth: 48 }}>Match</span><span style={{ wordBreak: "break-all" }}>{sequence.replace(/[ACGT]/gi, (m) => ({ A: "T", T: "A", C: "G", G: "C" }[m.toUpperCase()] || m))}</span></div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: 14, border: `1px solid ${colors.border}`, borderRadius: 8, background: colors.surface, fontSize: "0.78rem", color: "var(--c-muted)" }}>
                Drag the DNA model in the viewer to inspect the helix from different angles.
              </div>
            </aside>
          </div>
        )}

        {activeTab === "history" && (
          <div style={{ marginTop: 24 }}>
            {history.length > 0 && (
              <div className="minimal-workbench-grid" style={{ marginBottom: 24 }}>
                <div className="minimal-workbench-metric"><p>Total Runs</p><p>{history.length}</p></div>
                <div className="minimal-workbench-metric"><p>Promoters</p><p>{history.filter((i) => i.label === "promoter").length}</p></div>
                <div className="minimal-workbench-metric"><p>Promoter Ratio</p><p>{Math.round((history.filter((i) => i.label === "promoter").length / history.length) * 100)}%</p></div>
                <div className="minimal-workbench-metric"><p>Avg Confidence</p><p>{Math.round((history.reduce((a, c) => a + c.confidence, 0) / history.length) * 100)}%</p></div>
              </div>
            )}

            <div className="minimal-panel">
              <div className="minimal-panel-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Saved Prediction History</h2>
                    <p style={{ fontSize: "0.78rem", color: "var(--c-muted)", marginTop: 4 }}>Sequence classifications logged for this session.</p>
                  </div>
                </div>

                {history.length === 0 && (
                  <div className="minimal-empty">
                    <p>No predictions recorded yet</p>
                    <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Run a sequence analysis on the Analyze tab to log results.</p>
                  </div>
                )}

                {history.length > 0 && (
                  <div style={{ overflowX: "auto" }}>
                    <table className="minimal-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Result</th>
                          <th>Probability</th>
                          <th>Model</th>
                          <th>Length</th>
                          <th>GC %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item, index) => (
                          <tr key={item.id ?? `history-${index}`}>
                            <td style={{ color: "var(--c-muted)" }}>#{item.id}</td>
                            <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 600, border: `1px solid ${colors.border}`, background: colors.surface }}>{item.label === "promoter" ? "Promoter" : "Non-promoter"}</span></td>
                            <td style={{ fontWeight: 700 }}>{Math.round(item.promoter_probability * 100)}%</td>
                            <td style={{ textTransform: "uppercase", color: "var(--c-muted)" }}>{item.model}</td>
                            <td>{item.sequence.length} bp</td>
                            <td>{Math.round(item.sequence.gc_content * 100)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Guide */}
      <section className="minimal-section minimal-section-alt">
        <div style={{ marginBottom: 32 }}>
          <span className="minimal-kicker">Guide</span>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 0" }}>Learn the key markers.</h2>
        </div>
        <div className="minimal-guide">
          <article className="minimal-guide-card"><b className="minimal-motif found" style={{ background: "var(--c-base-a)", borderColor: "var(--c-base-a)" }}>−35</b><h3>Recognition region</h3><p>The −35 hexamer (TTGACA) is a conserved sequence where RNA polymerase binds. Not all promoters contain an exact match — partial matches still carry signal.</p></article>
          <article className="minimal-guide-card"><b className="minimal-motif found" style={{ background: "var(--c-base-t)", borderColor: "var(--c-base-t)" }}>−10</b><h3>AT-rich region</h3><p>The −10 hexamer (TATAAT or TATA) is AT-rich, making the DNA easier to melt open for transcription initiation.</p></article>
          <article className="minimal-guide-card"><b className="minimal-motif found" style={{ background: "var(--c-accent)", borderColor: "var(--c-accent)" }}>+1</b><h3>Transcription start</h3><p>The +1 site is where the RNA polymerase begins synthesizing the downstream transcript. It marks the boundary of the promoter region.</p></article>
        </div>
      </section>

      <footer className="minimal-footer">
        <span>PromoterLab</span>
      </footer>
    </main>
  );
}
