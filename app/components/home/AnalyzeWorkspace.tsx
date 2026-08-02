import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Download, FlaskConical } from "lucide-react";
import { SAMPLES } from "./sequence";
import type { BaseStats, Prediction } from "./types";

type AnalyzeWorkspaceProps = {
  sequence: string;
  setSequence: Dispatch<SetStateAction<string>>;
  baseStats: BaseStats | null;
  validationError: string | null;
  error: string | null;
  copyNotification: boolean;
  isLoading: boolean;
  prediction: Prediction | null;
  onCopy: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onDownload: () => void;
};

export function AnalyzeWorkspace({
  sequence,
  setSequence,
  baseStats,
  validationError,
  error,
  copyNotification,
  isLoading,
  prediction,
  onCopy,
  onSubmit,
  onDownload,
}: AnalyzeWorkspaceProps) {
  return (
    <div className="minimal-workspace-grid">
      <form onSubmit={onSubmit} className="minimal-panel">
        <div className="minimal-panel-body">
          <div className="minimal-presets">
            {SAMPLES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setSequence(sample.sequence)}
                className={`minimal-preset ${sequence === sample.sequence ? "active" : ""}`}
              >
                {sample.label}
              </button>
            ))}
          </div>
          <div className="sequence-label-row">
            <label htmlFor="sequence">DNA Sequence (5′ → 3′)</label>
            {baseStats && <span>{baseStats.total} bp</span>}
          </div>
          <textarea
            id="sequence"
            value={sequence}
            onChange={(event) => setSequence(event.target.value.toUpperCase())}
            placeholder="Paste DNA sequence (A, C, G, T)..."
            spellCheck={false}
            className="minimal-textarea"
          />
          {sequence && (
            <div className="sequence-actions">
              <button
                type="button"
                onClick={onCopy}
                className="minimal-secondary-btn"
              >
                {copyNotification ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => setSequence("")}
                className="minimal-secondary-btn"
              >
                Reset
              </button>
            </div>
          )}
          {baseStats && (
            <div className="base-composition">
              <div className="base-composition-label">
                <span>Base Composition</span>
                <span>
                  GC {baseStats.gc}% · AT {baseStats.at}%
                </span>
              </div>
              <div className="minimal-basebar">
                <div
                  className="base-composition-a"
                  style={{
                    width: `${(baseStats.counts.A / baseStats.total) * 100}%`,
                  }}
                />
                <div
                  className="base-composition-t"
                  style={{
                    width: `${(baseStats.counts.T / baseStats.total) * 100}%`,
                  }}
                />
                <div
                  className="base-composition-c"
                  style={{
                    width: `${(baseStats.counts.C / baseStats.total) * 100}%`,
                  }}
                />
                <div
                  className="base-composition-g"
                  style={{
                    width: `${(baseStats.counts.G / baseStats.total) * 100}%`,
                  }}
                />
              </div>
              <div className="base-counts">
                <span>
                  A <b>{baseStats.counts.A}</b>
                </span>
                <span>
                  C <b>{baseStats.counts.C}</b>
                </span>
                <span>
                  G <b>{baseStats.counts.G}</b>
                </span>
                <span>
                  T <b>{baseStats.counts.T}</b>
                </span>
              </div>
              <div className="motif-row">
                <span
                  className={`minimal-motif ${baseStats.has35 ? "found" : "missing"}`}
                >
                  {baseStats.has35 ? "✓ −35 Box (TTGACA)" : "No exact −35 box"}
                </span>
                <span
                  className={`minimal-motif ${baseStats.has10 ? "found" : "missing"}`}
                >
                  {baseStats.has10 ? "✓ −10 Box (TATAAT)" : "No exact −10 box"}
                </span>
              </div>
            </div>
          )}
          {(error || validationError) && (
            <div role="alert" className="minimal-error">
              {error || validationError}
            </div>
          )}
          <button
            disabled={isLoading}
            type="submit"
            className="minimal-cta minimal-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="minimal-spinner" />
                Analyzing…
              </>
            ) : (
              <>
                <FlaskConical aria-hidden="true" />
                Run Prediction
              </>
            )}
          </button>
        </div>
      </form>
      <section className="minimal-results" aria-live="polite">
        <div className="minimal-result-header">
          <h2>Prediction Result</h2>
          {prediction && (
            <button onClick={onDownload} className="minimal-secondary-btn">
              <Download aria-hidden="true" /> JSON
            </button>
          )}
        </div>
        {!prediction && !isLoading && (
          <div className="minimal-empty">
            <p>Ready for sequence input</p>
            <p>Select a preset or enter a sequence, then run prediction.</p>
          </div>
        )}
        {isLoading && (
          <div className="minimal-loading">
            <span className="minimal-spinner" />
            <p>Analyzing sequence motifs…</p>
          </div>
        )}
        {prediction && (
          <div>
            <div
              className={`prediction-status prediction-status-${prediction.label}`}
            >
              {prediction.label === "promoter"
                ? "Promoter Region Detected"
                : "Non-Promoter Region"}
            </div>
            <div className="prediction-summary">
              <div>
                <p className="minimal-result-big">
                  {Math.round(prediction.promoter_probability * 100)}%
                </p>
                <p>Promoter Probability</p>
              </div>
              <div>
                <strong>{Math.round(prediction.confidence * 100)}%</strong>
                <p>Confidence</p>
              </div>
            </div>
            <div
              className={`minimal-result-bar result-bar-${prediction.label}`}
            >
              <div
                style={{
                  width: `${Math.round(prediction.promoter_probability * 100)}%`,
                }}
              />
            </div>
            <div className="minimal-workbench-grid prediction-metrics">
              <div className="minimal-workbench-metric">
                <p>Sequence</p>
                <p>{prediction.sequence.length} bp</p>
              </div>
              <div className="minimal-workbench-metric">
                <p>GC Content</p>
                <p>{Math.round(prediction.sequence.gc_content * 100)}%</p>
              </div>
              <div className="minimal-workbench-metric">
                <p>Model</p>
                <p>XGBoost</p>
              </div>
              <div className="minimal-workbench-metric">
                <p>Classification</p>
                <p>
                  {prediction.label === "promoter"
                    ? "Positive (+)"
                    : "Negative (−)"}
                </p>
              </div>
            </div>
            <p className="prediction-note">
              A probability score indicates the model&apos;s prediction strength
              — not a biological certainty.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
