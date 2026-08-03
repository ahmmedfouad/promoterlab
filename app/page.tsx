"use client";

import { useMemo, useRef, useState } from "react";
import { AnalyzeWorkspace } from "./components/home/AnalyzeWorkspace";
import { DnaExplorer } from "./components/home/DnaExplorer";
import { GuideSection } from "./components/home/GuideSection";
import { HistoryPanel } from "./components/home/HistoryPanel";
import { HomeIntro } from "./components/home/HomeIntro";
import {
  calculateBaseStats,
  getStats,
  SAMPLES,
  validateSequence,
} from "./components/home/sequence";
import type { Prediction, Tab } from "./components/home/types";
import { SiteHeader } from "./components/SiteHeader";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [sequence, setSequence] = useState(SAMPLES[0].sequence);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyNotification, setCopyNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("analyze");
  const analyzeSectionRef = useRef<HTMLElement>(null);

  const stats = useMemo(() => getStats(sequence), [sequence]);
  const baseStats = useMemo(() => calculateBaseStats(sequence), [sequence]);
  const validationError = useMemo(() => validateSequence(sequence), [sequence]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setPrediction(null);
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-user-id": "local-user",
      };
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (apiKey) headers["x-api-key"] = apiKey;
      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/v1/predictions`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ sequence, model: "xgboost" }),
        },
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error?.message ?? "Prediction analysis failed.",
        );
      setPrediction(payload as Prediction);
      setHistory((items) => [payload as Prediction, ...items].slice(0, 50));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The prediction analysis failed.",
      );
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
    const download = document.createElement("a");
    download.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(prediction, null, 2))}`;
    download.download = `promoterlab_prediction_${Date.now()}.json`;
    download.click();
  }

  function startAnalysis() {
    setActiveTab("analyze");
    analyzeSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    analyzeSectionRef.current?.classList.add("minimal-section-highlight");
    window.setTimeout(
      () =>
        analyzeSectionRef.current?.classList.remove(
          "minimal-section-highlight",
        ),
      1200,
    );
  }

  return (
    <main className="minimal-page">
      <SiteHeader />
      <HomeIntro stats={stats} onStart={startAnalysis} />
      <section
        ref={analyzeSectionRef}
        id="analyze-section"
        className="minimal-section"
      >
        <div className="minimal-tabs" role="tablist">
          {(["analyze", "explainer", "history"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`minimal-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "analyze" ? (
                "Analyze"
              ) : tab === "explainer" ? (
                "View DNA"
              ) : (
                <>
                  Past results
                  {history.length > 0 && (
                    <span className="history-count">{history.length}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
        {activeTab === "analyze" && (
          <AnalyzeWorkspace
            sequence={sequence}
            setSequence={setSequence}
            baseStats={baseStats}
            validationError={validationError}
            error={error}
            copyNotification={copyNotification}
            isLoading={isLoading}
            prediction={prediction}
            onCopy={handleCopySequence}
            onSubmit={handleSubmit}
            onDownload={handleDownloadJSON}
          />
        )}
        {activeTab === "explainer" && <DnaExplorer sequence={sequence} />}
        {activeTab === "history" && <HistoryPanel history={history} />}
      </section>
      <GuideSection />
      <footer className="minimal-footer">
        <span>PromoterLab</span>
      </footer>
    </main>
  );
}
