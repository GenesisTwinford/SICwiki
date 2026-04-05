// アプリ全体で共通の外枠

import type { ReactNode } from "react";
import Link from "next/link";
import LoginButton from "@/app/components/LoginButton";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
<div className="min-h-screen bg-#ffffff_100% text-slate-900">
  <div className="flex">

    {/* 左サイドバー */}
    <aside className="sticky top-0 flex h-screen w-82 shrink-0 flex-col gap-2 border-r border-black/10 bg-white/80 p-4 backdrop-blur">
      <Link href="/" className="mb-4 font-heading text-6xl font-semibold text-slate-950">
        SIC Wiki
      </Link>
      <Link
        href="/article/new"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-50"
      >
        記事を作る
      </Link>
      <div className="mt-auto">
        <LoginButton />
      </div>
    </aside>

    {/* メインコンテンツ */}
    <main className="mx-auto max-w-7xl min-w-0 flex-1 px-4 py-6 sm:px-6">
      <div>
        {children}
      </div>
    </main>

  </div>
</div>
  );
}
