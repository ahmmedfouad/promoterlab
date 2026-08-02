export type Prediction = {
  id?: number;
  model: "xgboost";
  label: "promoter" | "non_promoter";
  confidence: number;
  promoter_probability: number;
  sequence: { length: number; gc_content: number };
  created_at?: string;
};

export type BaseStats = {
  counts: { A: number; C: number; G: number; T: number };
  gc: number;
  at: number;
  total: number;
  has35: boolean;
  has10: boolean;
};

export type Tab = "analyze" | "explainer" | "history";
