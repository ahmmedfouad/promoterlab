import type { Prediction } from "./types";

export function HistoryPanel({ history }: { history: Prediction[] }) {
  const promoters = history.filter((item) => item.label === "promoter").length;
  const averageConfidence = history.length
    ? Math.round(
        (history.reduce((total, item) => total + item.confidence, 0) /
          history.length) *
          100,
      )
    : 0;
  return (
    <div className="minimal-tab-content">
      {history.length > 0 && (
        <div className="minimal-workbench-grid history-metrics">
          <div className="minimal-workbench-metric">
            <p>Total Runs</p>
            <p>{history.length}</p>
          </div>
          <div className="minimal-workbench-metric">
            <p>Promoters</p>
            <p>{promoters}</p>
          </div>
          <div className="minimal-workbench-metric">
            <p>Promoter Ratio</p>
            <p>{Math.round((promoters / history.length) * 100)}%</p>
          </div>
          <div className="minimal-workbench-metric">
            <p>Avg Confidence</p>
            <p>{averageConfidence}%</p>
          </div>
        </div>
      )}
      <div className="minimal-panel">
        <div className="minimal-panel-body">
          <div className="history-heading">
            <div>
              <h2>Saved Prediction History</h2>
              <p>Sequence classifications logged for this session.</p>
            </div>
          </div>
          {history.length === 0 && (
            <div className="minimal-empty">
              <p>No predictions recorded yet</p>
              <p>Run a sequence analysis on the Analyze tab to log results.</p>
            </div>
          )}
          {history.length > 0 && (
            <div className="minimal-table-wrap">
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
                      <td>#{item.id}</td>
                      <td>
                        <span className="history-result">
                          {item.label === "promoter"
                            ? "Promoter"
                            : "Non-promoter"}
                        </span>
                      </td>
                      <td>
                        <strong>
                          {Math.round(item.promoter_probability * 100)}%
                        </strong>
                      </td>
                      <td className="history-model">{item.model}</td>
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
  );
}
