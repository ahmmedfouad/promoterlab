"use client";

import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function SiteHeader() {
  return (
    <header className="minimal-header">
      <div className="minimal-header-inner">
        <BrandMark />
        <nav aria-label="Main navigation" className="minimal-nav">
         
        
        </nav>
      
      </div>
    </header>
  );
}