import type { ReactNode } from "react";
import Link from "next/link";
import LoginButton from "@/app/components/LoginButton";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#fff9ef_48%,#ffffff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[28px] border border-black/10 bg-white/80 p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                  SIC
                </span>
                <div>
                  <p className="font-heading text-2xl font-semibold text-slate-950">SIC Wiki</p>
                  <p className="text-sm text-slate-600">
                    コース型で学習導線をたどれる、学び直し向けの Wiki
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Link
                  href="/"
                  className="rounded-full border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  ホーム
                </Link>
                <Link
                  href="/article/new"
                  className="rounded-full border border-slate-200 px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  記事を作る
                </Link>
              </nav>
              <LoginButton />
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
