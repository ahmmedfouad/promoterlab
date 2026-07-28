import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 blur-[120px]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
            <span className="font-mono text-lg font-black text-slate-950">P</span>
          </div>
          <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-90">
            PromoterLab <span className="text-cyan-400">AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25">
                Get started
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">
                Dashboard
              </Link>
              <UserButton />
            </div>
          </Show>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.25fr_0.75fr] lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            E. coli Promoter Intelligence Platform
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
            Analyze DNA sequences with confidence &amp; precision.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Predict promoter regions in E. coli DNA sequences using dual SVM and XGBoost machine learning models. Built with 347 k-mer and physicochemical features.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button className="rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-7 py-3.5 font-bold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400 hover:shadow-xl hover:shadow-cyan-500/25">
                  Start Analysis Free &rarr;
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="rounded-2xl border border-slate-800 bg-slate-900/60 px-7 py-3.5 font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-800">
                  Sign in to workspace
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-7 py-3.5 font-bold text-slate-950 transition hover:from-cyan-300 hover:to-cyan-400 hover:shadow-xl hover:shadow-cyan-500/25">
                Open Sequence Workspace &rarr;
              </Link>
            </Show>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Architecture Features</p>
          <dl className="mt-6 space-y-6">
            <div className="border-b border-slate-800/60 pb-4">
              <dt className="text-3xl font-extrabold text-white">347</dt>
              <dd className="mt-1 text-sm text-slate-400">Sequence, k-mer (2-4), and physicochemical properties extracted</dd>
            </div>
            <div className="border-b border-slate-800/60 pb-4">
              <dt className="text-3xl font-extrabold text-white">Dual ML Models</dt>
              <dd className="mt-1 text-sm text-slate-400">Selectable Support Vector Machines &amp; XGBoost Boosted Trees</dd>
            </div>
            <div>
              <dt className="text-3xl font-extrabold text-white">Clerk Protected</dt>
              <dd className="mt-1 text-sm text-slate-400">Session JWT tokens verify prediction requests and user history</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
