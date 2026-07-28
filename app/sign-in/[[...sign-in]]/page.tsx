import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Dna } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#090d16] px-4 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background ambient lighting & grid matching Clerk theme */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-600/20 via-indigo-600/20 to-cyan-500/10 blur-[120px]" />

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#090d16]">
            <Dna className="h-5 w-5 text-indigo-400" />
          </div>
        </div>
        <Link href="/" className="text-2xl font-black tracking-tight text-white hover:opacity-90">
          Vinca <span className="text-indigo-400">Genomics</span>
        </Link>
      </div>

      <div className="relative z-10 rounded-3xl border border-slate-800 bg-slate-900/40 p-4 shadow-2xl backdrop-blur-xl">
        <SignIn />
      </div>
    </main>
  );
}
