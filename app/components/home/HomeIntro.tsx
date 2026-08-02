import { ArrowRight } from "lucide-react";

type HomeIntroProps = {
  stats: { length: number; gc: number; has35: boolean; has10: boolean };
  onStart: () => void;
};

export function HomeIntro({ stats, onStart }: HomeIntroProps) {
  return (
    <>
      <section className="minimal-section">
        <div className="minimal-hero">
          <div>
            <p className="minimal-kicker">PromoterLab</p>
            <h1>Check a DNA sequence.</h1>
            <p>
              Submit a fragment and run the classifier to predict whether a
              promoter region is present.
            </p>
            <button onClick={onStart} className="minimal-cta minimal-hero-cta">
              Start Analysis <ArrowRight aria-hidden="true" />
            </button>
          </div>
          <div className="minimal-panel minimal-preview-panel">
            <div className="minimal-panel-header">Live Preview</div>
            <div className="minimal-panel-body">
              <div className="minimal-basebar minimal-preview-basebar">
                <div
                  className="base-composition-a"
                  style={{ width: `${stats.gc}%` }}
                />
                <div
                  className="base-composition-t"
                  style={{ width: `${100 - stats.gc}%` }}
                />
              </div>
              <div className="minimal-stat-list">
                <span className="minimal-stat">
                  <strong>{stats.length}</strong> bp
                </span>
                <span className="minimal-stat">
                  GC <strong>{stats.gc}%</strong>
                </span>
                <span
                  className={`minimal-motif ${stats.has35 ? "found" : "missing"}`}
                >
                  {stats.has35 ? "TTGACA found" : "No −35 box"}
                </span>
                <span
                  className={`minimal-motif ${stats.has10 ? "found" : "missing"}`}
                >
                  {stats.has10 ? "TATAAT found" : "No −10 box"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="minimal-section minimal-section-alt">
        <div className="minimal-stations">
          <div className="minimal-station">
            <p className="minimal-station-num">01 / Add</p>
            <h3>Enter a sequence</h3>
            <p>
              Paste a DNA fragment or choose a preset from the library. Only A,
              C, G, T bases are accepted.
            </p>
          </div>
          <div className="station-arrow">→</div>
          <div className="minimal-station">
            <p className="minimal-station-num">02 / Mark</p>
            <h3>Inspect motifs</h3>
            <p>
              The tool highlights the −35 and −10 consensus hexamers, if
              present, as contextual signals.
            </p>
          </div>
          <div className="station-arrow">→</div>
          <div className="minimal-station">
            <p className="minimal-station-num">03 / Run</p>
            <h3>Get a prediction</h3>
            <p>Submit the sequence to the XGBoost classifier.</p>
          </div>
          <div className="station-arrow">→</div>
          <div className="minimal-station">
            <p className="minimal-station-num">04 / Review</p>
            <h3>Check history</h3>
            <p>
              All past runs are saved to this session for review and export.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
