"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import { Interactive3DDNA } from "./components/Interactive3DDNA";
import { SiteHeader } from "./components/SiteHeader";

const SAMPLES = [
  { label: "Promoter candidate", sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC" },
  { label: "High-GC coding region", sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA" },
  { label: "AT-rich upstream region", sequence: "TTGACATTTTTATATATATATATATATATATATAATGCATCGATCGATCGATCGATC" },
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

export default function Home() {
  const [sequence, setSequence] = useState(SAMPLES[0].sequence);
  const stats = useMemo(() => getStats(sequence), [sequence]);

  return (
    <main className="atlas-page min-h-screen overflow-x-hidden text-[#18202B]">
      {/* THESIS: PromoterLab is a tactile route from raw sequence to a legible promoter call, not a generic SaaS hero. OWN-WORLD: warm paper, federal blue, coral, sunflower, black ink, halftone and offset-print layers. STORY: visitors see the evidence path, try a sequence, then enter the classifier. FIRST VIEWPORT: an atlas rail frames a four-station sequence journey; primary action sits beneath the route. FORM: Riso Lab Atlas, expedition staging, seed f978a759. */}
      <SiteHeader />
      {/* <header className="atlas-topbar">
        <Link href="/" className="atlas-brand" aria-label="PromoterLab home">
          <Dna aria-hidden="true" /> <span>Promoter<span>Lab</span></span>
        </Link>
        <p className="hidden text-sm font-semibold md:block">DNA promoter prediction · field edition</p>
        <nav aria-label="Primary navigation" className="atlas-nav">
          <a href="#expedition">Expedition</a>
          <a href="#field-guide">Field guide</a>
          <Link href="/workspace" className="atlas-nav-action">Open classifier <ArrowRight aria-hidden="true" /></Link>
        </nav>
      </header> */}

      <section id="expedition" className="atlas-expedition">
        <aside className="atlas-index" aria-label="Atlas index">
          <p>VOLUME 01</p>
          <strong>What to look for</strong>
          <ol>
            <li className="is-active"><a href="#expedition">Start here</a></li>
            <li><a href="#workbench">Try it</a></li>
            <li><a href="#field-guide">Learn</a></li>
          </ol>
          <div className="atlas-stamp"><FlaskConical aria-hidden="true" /> Open research tool</div>
        </aside>

        <div className="atlas-route">
          <div className="atlas-intro">
            <p className="atlas-kicker">PROMOTERLAB · ATLAS EDITION</p>
            <h1>Check a DNA sequence.</h1>
            <p>Follow a DNA fragment through motif marking and promoter context, then run the classifier in an open workspace.</p>
          </div>

          <div className="route-stations" aria-label="Prediction journey">
            <article className="route-station route-input">
              <span>01</span><h2>Add sequence</h2>
              <code>{sequence.slice(0, 30)}…</code>
            </article>
            <div className="route-arrow" aria-hidden="true">→</div>
            <article className="route-station route-motif">
              <span>02</span><h2>Find patterns</h2>
              <div className="motif-line"><i className={stats.has35 ? "found" : ""}>TTGACA</i><i className={stats.has10 ? "found yellow" : "yellow"}>TATAAT</i></div>
            </article>
            <div className="route-arrow" aria-hidden="true">→</div>
            <article className="route-station route-map">
              <span>03</span><h2>See the map</h2>
              <div className="mini-map"><b /> <b /> <b /> <b className="coral" /> <em>TSS +1</em></div>
            </article>
            <div className="route-arrow" aria-hidden="true">→</div>
            <article className="route-station route-outcome">
              <span>04</span><h2>Get a result</h2>
              <div className="outcome-ring" aria-hidden="true"><strong>?</strong></div>
              <p>Run a sequence to inspect the model output.</p>
            </article>
          </div>

          <div className="atlas-launch">
            <Sparkles aria-hidden="true" />
            <p>Ready to investigate a sequence?</p>
            <Link href="/workspace" className="atlas-button">Launch classifier <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section id="workbench" className="atlas-workbench">
        <div className="section-title"><span>Try it</span><h2>Review your sequence first.</h2></div>
        <div className="workbench-grid">
          <div className="sequence-sheet">
            <div className="sheet-tabs">{SAMPLES.map((sample) => <button key={sample.label} onClick={() => setSequence(sample.sequence)} className={sequence === sample.sequence ? "selected" : ""}>{sample.label}</button>)}</div>
            <label htmlFor="sequence">Working sequence</label>
            <textarea id="sequence" value={sequence} onChange={(event) => setSequence(event.target.value.toUpperCase())} spellCheck={false} />
            <div className="sequence-foot"><span>{stats.length} bp</span><span>GC {stats.gc}%</span><span>{stats.has35 ? "−35 motif marked" : "No exact −35 motif"}</span></div>
            <Link href="/workspace" className="inline-link">Run this in the classifier <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="composition-dial" aria-label={`Base composition: ${stats.gc}% GC`}>
            <div className="dial-ring"><strong>{stats.gc}%</strong><span>GC content</span></div>
            <p>GC content is a quick reading aid, not a prediction. The classifier evaluates the full input sequence.</p>
            <div className="legend"><span><i className="blue" /> G + C</span><span><i className="coral-dot" /> A + T</span></div>
          </div>
          <div className="helix-panel"><Interactive3DDNA activeSequence={sequence} /></div>
        </div>
      </section>

      <section id="field-guide" className="atlas-guide">
        <div className="section-title"><span>Guide</span><h2>Learn the key markers.</h2></div>
        <div className="guide-track">
          <article><b className="guide-marker blue">−35</b><h3>Recognition region</h3><p>Promoter motifs are inspected as contextual signals rather than a single decisive feature.</p></article>
          <article><b className="guide-marker yellow">−10</b><h3>AT-rich region</h3><p>AT-rich motifs are commonly discussed when explaining transcription initiation.</p></article>
          <article><b className="guide-marker coral-marker">+1</b><h3>Transcription start</h3><p>The reference point where transcription begins and the downstream gene region follows.</p></article>
        </div>
      </section>

      <footer className="atlas-footer"><span>PromoterLab · Riso Lab Atlas</span><Link href="/workspace">Use the open classifier <ArrowRight aria-hidden="true" /></Link></footer>
    </main>
  );
}
