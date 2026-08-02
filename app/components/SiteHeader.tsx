"use client";

import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="minimal-header">
      <div className="minimal-header-inner">
        <BrandMark />
        <p className="minimal-product-context">DNA promoter analysis</p>
        <div className="minimal-header-status" aria-label="Active prediction model">XGBoost</div>
      </div>
    </header>
  );
}
