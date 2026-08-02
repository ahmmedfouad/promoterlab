export function GuideSection() {
  return (
    <section className="minimal-section minimal-section-alt">
      <div className="guide-heading">
        <span className="minimal-kicker">Guide</span>
        <h2>Learn the key markers.</h2>
      </div>
      <div className="minimal-guide">
        <article className="minimal-guide-card">
          <b className="minimal-motif found guide-marker-35">−35</b>
          <h3>Recognition region</h3>
          <p>
            The −35 hexamer (TTGACA) is a conserved sequence where RNA
            polymerase binds. Not all promoters contain an exact match — partial
            matches still carry signal.
          </p>
        </article>
        <article className="minimal-guide-card">
          <b className="minimal-motif found guide-marker-10">−10</b>
          <h3>AT-rich region</h3>
          <p>
            The −10 hexamer (TATAAT or TATA) is AT-rich, making the DNA easier
            to melt open for transcription initiation.
          </p>
        </article>
        <article className="minimal-guide-card">
          <b className="minimal-motif found guide-marker-start">+1</b>
          <h3>Transcription start</h3>
          <p>
            The +1 site is where RNA polymerase begins synthesizing the
            downstream transcript. It marks the boundary of the promoter region.
          </p>
        </article>
      </div>
    </section>
  );
}
