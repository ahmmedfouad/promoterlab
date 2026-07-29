"use client";

import Link from "next/link";
import { Dna, Moon, Sun } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

type SiteHeaderProps = { children?: ReactNode };

export function SiteHeader({ children }: SiteHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("promoterlab-theme") as "light" | "dark" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = initial;
    const frame = window.requestAnimationFrame(() => setTheme(initial));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("promoterlab-theme", next);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="PromoterLab home"><Dna aria-hidden="true" /> <span>Promoter<span>Lab</span></span></Link>
        <nav aria-label="Main navigation" className="site-nav"><Link href="/">Home</Link><Link href="/#field-guide">Guide</Link><Link href="/workspace">Workspace</Link></nav>
        <div className="site-actions">
          {children}
          <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}>
            {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}<span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
