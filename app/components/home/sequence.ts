import type { BaseStats } from "./types";

export const SAMPLES = [
  { label: "Promoter", sequence: "TTGACATGCATCGATCGATCGATCGATCGATATAAATGCATCGATCGATCGATCGATC" },
  { label: "High-GC", sequence: "ATGGCGCGTCGTGCGCCGCGCATGCTGCGTGCGCTGCGCCGCTACGGCGTCGTCGCGTGA" },
  { label: "AT-rich", sequence: "TTGACATTTTTATATATATATATATATATATAATGCATCGATCGATCGATCGATC" },
];

export function getStats(sequence: string) {
  const clean = sequence.replace(/\s/g, "").toUpperCase();
  if (!clean) return { length: 0, gc: 0, has35: false, has10: false };
  const count = (base: string) => [...clean].filter((char) => char === base).length;
  return {
    length: clean.length,
    gc: Math.round(((count("G") + count("C")) / clean.length) * 100),
    has35: clean.includes("TTGACA"),
    has10: clean.includes("TATAAT") || clean.includes("TATAA"),
  };
}

export function calculateBaseStats(sequence: string): BaseStats | null {
  const normalized = sequence.replace(/\s/g, "").toUpperCase();
  if (!normalized) return null;
  const counts = { A: 0, C: 0, G: 0, T: 0 };
  for (const base of normalized) {
    if (base in counts) counts[base as keyof typeof counts]++;
  }
  const total = normalized.length;
  return {
    counts,
    gc: Math.round(((counts.G + counts.C) / total) * 100),
    at: Math.round(((counts.A + counts.T) / total) * 100),
    total,
    has35: normalized.includes("TTGACA"),
    has10: normalized.includes("TATAAT") || normalized.includes("TATAA"),
  };
}

export function validateSequence(sequence: string) {
  const normalized = sequence.replace(/\s/g, "").toUpperCase();
  if (!normalized) return "Enter a DNA sequence to analyze.";
  if (normalized.length < 4) return "A sequence must contain at least 4 bases.";
  if (!/^[ACGT]+$/.test(normalized)) return "Sequence must contain only A, C, G, and T bases.";
  return null;
}

export function getComplement(sequence: string) {
  return sequence.replace(/[ACGT]/gi, (base) => ({ A: "T", T: "A", C: "G", G: "C" }[base.toUpperCase()] || base));
}
