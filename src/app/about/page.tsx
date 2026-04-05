import type { Metadata } from "next";
import Link from "next/link";
import { getAuthSession } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "About | SIC Wiki",
};

export default async function AboutPage() {
  await getAuthSession();

  return (
    <main>
      <div>
          <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            SIC
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-300"
          >
            ダッシュボードへ
          </Link>
        </div>
    </main>
  );
}
