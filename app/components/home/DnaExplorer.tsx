import { Interactive3DDNA } from "../Interactive3DDNA";
import { getComplement } from "./sequence";

export function DnaExplorer({ sequence }: { sequence: string }) {
  const displayedSequence = sequence || "TTGACATGCATCGATCGATCGATCGATC";
  return (
    <div className="minimal-workspace-grid minimal-tab-content">
      <div className="dna-viewer-wrap">
        <Interactive3DDNA activeSequence={sequence} />
      </div>
      <aside className="dna-explainer">
        <div className="minimal-panel">
          <div className="minimal-panel-body">
            <span className="minimal-detail-label">
              Readable Sequence Guide
            </span>
            <h3>Learn the paired bases.</h3>
            <p>
              The viewer shows the input strand and its complement so you can
              inspect the sequence before running prediction.
            </p>
            <div className="sequence-guide">
              <div>
                <span>Input</span>
                <b>{displayedSequence}</b>
              </div>
              <div>
                <span>Match</span>
                <b>{getComplement(displayedSequence)}</b>
              </div>
            </div>
          </div>
        </div>
        <p className="dna-helper">
          Drag the DNA model in the viewer to inspect the helix from different
          angles.
        </p>
      </aside>
    </div>
  );
}
